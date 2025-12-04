import React, { useState, useEffect, useCallback } from "react";
import {
  message,
  Empty,
  Button,
  Modal,
  Input,
  Rate,
  Card,
  Tag,
  Pagination,
  Skeleton,
  Spin,
  Badge,
  Tooltip,
  Progress,
  Divider,
} from "antd";
import {
  ExclamationCircleOutlined,
  EditOutlined,
  DeleteOutlined,
  StarFilled,
  ReloadOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import {
  reviewApi,
  Review,
  ReviewableProduct,
  UpdateReviewData,
} from "../../../services/ReviewService";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import Sidebar from "../../../components/User/Sidebar";

const { TextArea } = Input;
const { confirm } = Modal;

const UserReviewPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewableProducts, setReviewableProducts] = useState<
    ReviewableProduct[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [loadingReviewable, setLoadingReviewable] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // Modal states
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] =
    useState<ReviewableProduct | null>(null);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);

  // Form states
  const [rating, setRating] = useState(5);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Fetch user reviews
  const fetchUserReviews = useCallback(async (page = 1, limit = 10) => {
    try {
      setLoading(true);
      const response = await reviewApi.getMyReviews({
        page,
        limit,
        sort: "createdAt_desc",
      });

      if (response.data.success) {
        setReviews(response.data.data || []);
        const paginationData = response.data.pagination;
        setPagination({
          current: paginationData?.page || 1,
          pageSize: paginationData?.limit || 10,
          total: paginationData?.totalItems || 0,
        });
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Có lỗi x?y ra khi tại đánh giá";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch reviewable products
  const fetchReviewableProducts = useCallback(async () => {
    try {
      setLoadingReviewable(true);
      const response = await reviewApi.getReviewableProducts();
      if (response.data.success) {
        setReviewableProducts(response.data.data || []);
      }
    } catch (error: unknown) {
      console.error("Lỗi khi tại sản phẩm có thọ đánh giá:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message ||
            "Có lỗi x?y ra khi tại sản phẩm có thọ đánh giá";
      message.error(errorMessage);
    } finally {
      setLoadingReviewable(false);
    }
  }, []);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setInitialLoading(true);
      try {
        await Promise.all([fetchUserReviews(), fetchReviewableProducts()]);
      } finally {
        setInitialLoading(false);
      }
    };

    loadInitialData();
  }, [fetchUserReviews, fetchReviewableProducts]);

  // Reset form
  const resetForm = useCallback(() => {
    setRating(5);
    setContent("");
    setSelectedProduct(null);
    setSelectedReview(null);
  }, []);

  // Validate form
  const validateForm = useCallback(() => {
    if (!content.trim()) {
      message.error("Vui lòng nhập nội dung đánh giá!");
      return false;
    }
    if (content.trim().length < 10) {
      message.error("Nội dung đánh giá ph?i có ít nh?t 10 ký t?!");
      return false;
    }
    if (rating < 1 || rating > 5) {
      message.error("Vui lòng chơn số sao từ 1 đến 5!");
      return false;
    }
    return true;
  }, [content, rating]);

  // Handle create review
  const handleCreateReview = useCallback(async () => {
    if (!selectedProduct) return;
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const reviewData = {
        orderId: selectedProduct.orderId,
        orderItemId: selectedProduct.orderItemId,
        rating,
        content: content.trim(),
      };

      console.log("Ðang gửi đánh giá:", reviewData);

      const response = await reviewApi.createReview(reviewData);

      console.log("Phần h?i từ server:", response);

      if (response.data.success) {
        message.success("Ðánh giá sản phẩm thành công!");
        setIsCreateModalVisible(false);
        resetForm();
        // Refresh both reviews and reviewable products
        await Promise.all([fetchUserReviews(), fetchReviewableProducts()]);
      } else {
        message.error(
          response.data.message || "Có lỗi x?y ra khi t?o đánh giá"
        );
      }
    } catch (error: unknown) {
      console.error("Lỗi khi gửi đánh giá:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Có lỗi x?y ra khi t?o đánh giá";
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }, [
    selectedProduct,
    validateForm,
    rating,
    content,
    fetchUserReviews,
    fetchReviewableProducts,
    resetForm,
  ]);

  // Handle update review
  const handleUpdateReview = useCallback(async () => {
    if (!selectedReview) return;
    if (!validateForm()) return;

    try {
      setSubmitting(true);
      const updateData: UpdateReviewData = {
        rating,
        content: content.trim(),
      };

      const response = await reviewApi.updateReview(
        selectedReview._id,
        updateData
      );
      if (response.data.success) {
        message.success("Cập nhật đánh giá thành công!");
        setIsEditModalVisible(false);
        resetForm();
        fetchUserReviews(pagination.current, pagination.pageSize);
      }
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : (error as { response?: { data?: { message?: string } } })?.response
              ?.data?.message || "Có lỗi x?y ra khi cập nhật đánh giá";
      message.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  }, [
    selectedReview,
    validateForm,
    rating,
    content,
    fetchUserReviews,
    resetForm,
    pagination,
  ]);

  // Handle delete review
  const handleDeleteReview = useCallback(
    (review: Review) => {
      confirm({
        title: "Xác nhận xóa đánh giá",
        icon: <ExclamationCircleOutlined />,
        content: "Bẩn có chỉc chơn muẩn xóa đánh giá này không?",
        okText: "Xóa",
        okType: "danger",
        cancelText: "Hủy",
        onOk: async () => {
          try {
            const response = await reviewApi.deleteReview(review._id);
            if (response.data.success) {
              message.success("Xóa đánh giá thành công!");
              await Promise.all([
                fetchUserReviews(pagination.current, pagination.pageSize),
                fetchReviewableProducts(),
              ]);
            }
          } catch (error: unknown) {
            const errorMessage =
              error instanceof Error
                ? error.message
                : (error as { response?: { data?: { message?: string } } })
                    ?.response?.data?.message ||
                  "Có lỗi x?y ra khi xóa đánh giá";
            message.error(errorMessage);
          }
        },
      });
    },
    [fetchUserReviews, fetchReviewableProducts, pagination]
  );

  // Handle modal close with confirmation
  const handleModalClose = useCallback(
    (modalType: "create" | "edit") => {
      if (content.trim()) {
        confirm({
          title: "Xác nhận đóng",
          icon: <ExclamationCircleOutlined />,
          content:
            "Bẩn có thay đổi chua luu. Bẩn có chỉc chơn muẩn đóng không?",
          okText: "Ðóng",
          okType: "danger",
          cancelText: "Tiếp tục chơnh sửa",
          onOk: () => {
            if (modalType === "create") {
              setIsCreateModalVisible(false);
            } else {
              setIsEditModalVisible(false);
            }
            resetForm();
          },
        });
      } else {
        if (modalType === "create") {
          setIsCreateModalVisible(false);
        } else {
          setIsEditModalVisible(false);
        }
        resetForm();
      }
    },
    [content, resetForm]
  );

  // Open create modal
  const openCreateModal = useCallback((product: ReviewableProduct) => {
    setSelectedProduct(product);
    setRating(5);
    setContent("");
    setIsCreateModalVisible(true);
  }, []);

  // Open edit modal
  const openEditModal = useCallback((review: Review) => {
    setSelectedReview(review);
    setRating(review.rating);
    setContent(review.content);
    setIsEditModalVisible(true);
  }, []);

  // Handle pagination change
  const handlePaginationChange = useCallback(
    (page: number, pageSize?: number) => {
      fetchUserReviews(page, pageSize || pagination.pageSize);
    },
    [fetchUserReviews, pagination]
  );

  // Handle refresh all data
  const handleRefreshAll = useCallback(async () => {
    await Promise.all([
      fetchUserReviews(pagination.current, pagination.pageSize),
      fetchReviewableProducts(),
    ]);
    message.success("Ðã làm mới dữ liệu!");
  }, [fetchUserReviews, fetchReviewableProducts, pagination]);

  // Format date helper function
  const formatDate = useCallback((dateString: string) => {
    return format(new Date(dateString), "dd/MM/yyyy", { locale: vi });
  }, []);

  // Get product main image helper
  const getProductImage = useCallback((product: ReviewableProduct) => {
    if (product.image) return product.image;

    if (product.product.images && product.product.images.length > 0) {
      // Try to find main image first
      const mainImage = product.product.images.find((img) => img.isMain);
      if (mainImage) return mainImage.url;

      // Otherwise return first image
      return product.product.images[0].url;
    }

    return "/placeholder-image.jpg";
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-mono-50">
      <div className="flex flex-1">
        <Sidebar />
        <div className="flex-1 p-6">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-2">
                <h1 className="text-3xl font-bold text-mono-900">
                  Ðánh giá của tôi
                </h1>
                <Button
                  icon={<ReloadOutlined />}
                  onClick={handleRefreshAll}
                  loading={loading || loadingReviewable}
                  className="flex items-center gap-2"
                >
                  Làm mới tất cả
                </Button>
              </div>
              <p className="text-mono-600">
                Quận lý và viết đánh giá cho các sản phẩm bẩn dã mua
              </p>
            </div>

            {/* Initial Loading Overlay */}
            {initialLoading ? (
              <div className="flex justify-center items-center py-20">
                <div className="text-center">
                  <Spin size="large" />
                  <div className="mt-4 text-mono-600">Ðang tại dữ liệu...</div>
                </div>
              </div>
            ) : (
              <>
                {/* Reviewable Products Section */}
                <div className="mb-8">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-mono-100">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold flex items-center">
                        <span className="bg-mono-500 text-white rounded-full w-7 h-7 inline-flex items-center justify-center mr-2">
                          <CheckCircleOutlined />
                        </span>
                        Sản phẩm chờ đánh giá
                      </h2>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={fetchReviewableProducts}
                        loading={loadingReviewable}
                        size="small"
                        className="flex items-center gap-1"
                      >
                        Làm mới
                      </Button>
                    </div>

                    {loadingReviewable ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, index) => (
                          <Card
                            key={index}
                            className="hover:shadow-md transition-shadow"
                          >
                            <Skeleton.Image className="w-full h-48" />
                            <div className="mt-4">
                              <Skeleton active paragraph={{ rows: 2 }} />
                              <div className="mt-4">
                                <Skeleton.Button className="w-full" />
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : reviewableProducts.length === 0 ? (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                          <div className="text-mono-500">
                            <div className="font-medium mb-1">
                              Không có sản phẩm nào cẩn đánh giá
                            </div>
                            <div className="text-sm">
                              Tất cả sản phẩm dã được đánh giá ho?c bẩn chua có
                              don hàng nào dã giao
                            </div>
                          </div>
                        }
                      />
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {reviewableProducts.map((product) => (
                          <Badge.Ribbon
                            key={product.orderItemId}
                            text={`${product.daysLeftToReview} ngày còn lỗi`}
                            color="blue"
                          >
                            <Card
                              className="hover:shadow-md transition-shadow overflow-hidden"
                              cover={
                                <div className="h-48 overflow-hidden relative">
                                  <img
                                    src={getProductImage(product)}
                                    alt={product.product.name}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      const target =
                                        e.target as HTMLImageElement;
                                      target.src = "/placeholder-image.jpg";
                                    }}
                                  />
                                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-3">
                                    <div className="text-white text-xs">
                                      Mã don: {product.orderCode}
                                    </div>
                                  </div>
                                </div>
                              }
                              actions={[
                                <Button
                                  type="primary"
                                  onClick={() => openCreateModal(product)}
                                  className="w-full"
                                  key="review"
                                >
                                  Ðánh giá ngay
                                </Button>,
                              ]}
                            >
                              <Card.Meta
                                title={
                                  <Tooltip title={product.product.name}>
                                    <div className="text-sm">
                                      <div className="font-medium truncate">
                                        {product.product.name}
                                      </div>
                                      <div className="flex items-center justify-between mt-1">
                                        <div className="text-mono-500 text-xs">
                                          {product.variant.color.name} / Size{" "}
                                          {product.size.value}
                                        </div>
                                        <div className="text-sm font-medium text-mono-black">
                                          {new Intl.NumberFormat(
                                            "vi-VN"
                                          ).format(product.price)}
                                          d
                                        </div>
                                      </div>
                                    </div>
                                  </Tooltip>
                                }
                                description={
                                  <div className="mt-2">
                                    <div className="text-xs text-mono-500 flex items-center justify-between">
                                      <div>
                                        <Tooltip title="Ngày nhơn hàng">
                                          <span className="flex items-center">
                                            <ClockCircleOutlined className="mr-1" />
                                            {formatDate(product.deliveredAt)}
                                          </span>
                                        </Tooltip>
                                      </div>
                                      <Tooltip
                                        title={`Hơn đánh giá: ${
                                          product.reviewExpiresAt
                                            ? formatDate(
                                                product.reviewExpiresAt
                                              )
                                            : "Không giới hơn"
                                        }`}
                                      >
                                        <InfoCircleOutlined className="text-mono-500" />
                                      </Tooltip>
                                    </div>
                                  </div>
                                }
                              />
                            </Card>
                          </Badge.Ribbon>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Reviews List */}
                <div className="mb-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-mono-100">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold flex items-center">
                        <span className="bg-mono-700 text-white rounded-full w-7 h-7 inline-flex items-center justify-center mr-2">
                          <StarFilled />
                        </span>
                        Ðánh giá dã viết
                      </h2>
                      <Button
                        icon={<ReloadOutlined />}
                        onClick={() =>
                          fetchUserReviews(
                            pagination.current,
                            pagination.pageSize
                          )
                        }
                        loading={loading}
                        size="small"
                        className="flex items-center gap-1"
                      >
                        Làm mới
                      </Button>
                    </div>

                    {loading ? (
                      <div className="space-y-4">
                        {[...Array(2)].map((_, index) => (
                          <Card
                            key={index}
                            className="hover:shadow-md transition-shadow"
                          >
                            <div className="flex gap-4">
                              <Skeleton.Image className="w-20 h-20 rounded" />
                              <div className="flex-1">
                                <Skeleton active paragraph={{ rows: 2 }} />
                                <div className="flex justify-between items-center mt-3">
                                  <Skeleton.Button size="small" />
                                  <Skeleton.Button size="small" />
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    ) : reviews.length === 0 ? (
                      <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                          <div className="text-mono-500">
                            <div className="font-medium mb-1">
                              Bẩn chua có đánh giá nào
                            </div>
                            <div className="text-sm">
                              Hãy đánh giá các sản phẩm dã mua d? giúp người
                              khác tìm hi?u sản phẩm t?t hon
                            </div>
                          </div>
                        }
                      />
                    ) : (
                      <div className="space-y-4">
                        {reviews.map((review) => (
                          <Card
                            key={review._id}
                            className="hover:shadow-md transition-shadow border border-mono-100"
                          >
                            <div className="flex flex-col sm:flex-row gap-4">
                              <div className="flex-shrink-0">
                                <img
                                  src={
                                    review.product.images?.[0]?.url ||
                                    "/placeholder-image.jpg"
                                  }
                                  alt={review.product.name}
                                  className="w-20 h-20 object-cover rounded-lg border border-mono-200"
                                  onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    target.onerror = null;
                                    target.src = "/placeholder-image.jpg";
                                  }}
                                />
                              </div>

                              <div className="flex-grow">
                                <div className="flex flex-wrap items-start justify-between gap-2">
                                  <h3 className="font-medium text-lg">
                                    {review.product.name}
                                  </h3>
                                  <div className="text-xs text-mono-500 whitespace-nowrap">
                                    {format(
                                      new Date(review.createdAt),
                                      "dd/MM/yyyy HH:mm",
                                      { locale: vi }
                                    )}
                                  </div>
                                </div>

                                <div className="flex items-center gap-2 mb-2">
                                  <div className="flex">
                                    {[...Array(5)].map((_, index) => (
                                      <StarFilled
                                        key={index}
                                        className={
                                          index < review.rating
                                            ? "text-mono-600"
                                            : "text-mono-300"
                                        }
                                      />
                                    ))}
                                  </div>
                                  <span className="text-sm text-mono-600 font-medium">
                                    {review.rating}/5
                                  </span>
                                </div>

                                <p className="text-mono-700 mb-2 break-words">
                                  {review.content}
                                </p>

                                <div className="flex items-center flex-wrap gap-3 mt-3">
                                  <Tag
                                    color={review.isActive ? "green" : "red"}
                                    className="rounded-full px-2"
                                  >
                                    {review.isActive
                                      ? "Hiện thọ công khai"
                                      : "Ðã ẩn"}
                                  </Tag>
                                  <span className="text-xs text-mono-500 flex items-center">
                                    <StarFilled className="text-mono-600 mr-1" />
                                    {review.numberOfLikes} lu?t thích
                                  </span>

                                  <div className="flex-grow"></div>

                                  <Button
                                    type="text"
                                    size="small"
                                    icon={<EditOutlined />}
                                    onClick={() => openEditModal(review)}
                                    className="text-mono-500"
                                  >
                                    Sửa
                                  </Button>
                                  <Button
                                    type="text"
                                    size="small"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => handleDeleteReview(review)}
                                  >
                                    Xóa
                                  </Button>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}

                    {/* Pagination */}
                    {pagination.total > pagination.pageSize && (
                      <div className="flex justify-center mt-8">
                        <Pagination
                          current={pagination.current}
                          pageSize={pagination.pageSize}
                          total={pagination.total}
                          showSizeChanger
                          showQuickJumper
                          showTotal={(total, range) =>
                            `${range[0]}-${range[1]} của ${total} đánh giá`
                          }
                          onChange={handlePaginationChange}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Create Review Modal */}
            <Modal
              title="Ðánh giá sản phẩm"
              open={isCreateModalVisible}
              onOk={handleCreateReview}
              onCancel={() => handleModalClose("create")}
              confirmLoading={submitting}
              okText="Gửi đánh giá"
              cancelText="Hủy"
              keyboard={true}
              maskClosable={false}
              width={500}
            >
              {selectedProduct && (
                <div className="mb-5 bg-mono-50 p-4 rounded-lg">
                  <div className="flex gap-4">
                    <img
                      src={getProductImage(selectedProduct)}
                      alt={selectedProduct.product.name}
                      className="w-16 h-16 object-cover rounded-lg border border-mono-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-image.jpg";
                      }}
                    />
                    <div>
                      <h4 className="font-medium text-mono-800">
                        {selectedProduct.product.name}
                      </h4>
                      <p className="text-sm text-mono-500">
                        {selectedProduct.variant.color.name} - Size{" "}
                        {selectedProduct.size.value}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Tag color="blue" className="rounded-full text-xs">
                          {selectedProduct.orderCode}
                        </Tag>
                        <span className="text-xs text-mono-500">
                          Ngày giao: {formatDate(selectedProduct.deliveredAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 border-t border-mono-200 pt-3">
                    <div className="text-xs text-mono-500 flex items-center justify-between">
                      <span>
                        Thểi hơn đánh giá còn:{" "}
                        {selectedProduct.daysLeftToReview} ngày
                      </span>
                      <span>
                        Hơn cuối:{" "}
                        {selectedProduct.reviewExpiresAt
                          ? formatDate(selectedProduct.reviewExpiresAt)
                          : "Không giới hơn"}
                      </span>
                    </div>
                    <Progress
                      percent={Math.min(
                        100,
                        (selectedProduct.daysLeftToReview / 30) * 100
                      )}
                      size="small"
                      status="active"
                      showInfo={false}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              <Divider className="my-4" />

              <div className="mb-4 text-center">
                <label className="block text-sm font-medium mb-2">
                  M?c d? hài lòng của bẩn:
                </label>
                <Rate value={rating} onChange={setRating} className="text-xl" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Nội dung đánh giá:
                </label>
                <TextArea
                  rows={4}
                  value={content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setContent(e.target.value)
                  }
                  placeholder="Chia số trởi nghi?m của bẩn v? sản phẩm... (ít nh?t 10 ký t?)"
                  maxLength={500}
                  showCount
                  autoFocus
                  status={
                    content.trim().length > 0 && content.trim().length < 10
                      ? "error"
                      : ""
                  }
                />
                {content.trim().length > 0 && content.trim().length < 10 && (
                  <div className="text-mono-800 text-xs mt-1">
                    Nội dung đánh giá ph?i có ít nh?t 10 ký t?
                  </div>
                )}
              </div>
            </Modal>

            {/* Edit Review Modal */}
            <Modal
              title="Chơnh sửa đánh giá"
              open={isEditModalVisible}
              onOk={handleUpdateReview}
              onCancel={() => handleModalClose("edit")}
              confirmLoading={submitting}
              okText="Cập nhật"
              cancelText="Hủy"
              keyboard={true}
              maskClosable={false}
              width={500}
            >
              {selectedReview && (
                <div className="mb-4 bg-mono-50 p-4 rounded-lg">
                  <div className="flex gap-3">
                    <img
                      src={
                        selectedReview.product.images?.[0]?.url ||
                        "/placeholder-image.jpg"
                      }
                      alt={selectedReview.product.name}
                      className="w-16 h-16 object-cover rounded-lg border border-mono-200"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = "/placeholder-image.jpg";
                      }}
                    />
                    <div>
                      <h4 className="font-medium text-mono-800">
                        {selectedReview.product.name}
                      </h4>
                      <p className="text-xs text-mono-500 mt-1">
                        Ngày đánh giá:{" "}
                        {format(
                          new Date(selectedReview.createdAt),
                          "dd/MM/yyyy",
                          { locale: vi }
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <Divider className="my-4" />

              <div className="mb-4 text-center">
                <label className="block text-sm font-medium mb-2">
                  Ðánh giá sao:
                </label>
                <Rate value={rating} onChange={setRating} className="text-xl" />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  Nội dung đánh giá:
                </label>
                <TextArea
                  rows={4}
                  value={content}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setContent(e.target.value)
                  }
                  placeholder="Chia số trởi nghi?m của bẩn v? sản phẩm... (ít nh?t 10 ký t?)"
                  maxLength={500}
                  showCount
                  autoFocus
                  status={
                    content.trim().length > 0 && content.trim().length < 10
                      ? "error"
                      : ""
                  }
                />
                {content.trim().length > 0 && content.trim().length < 10 && (
                  <div className="text-mono-800 text-xs mt-1">
                    Nội dung đánh giá ph?i có ít nh?t 10 ký t?
                  </div>
                )}
              </div>
            </Modal>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserReviewPage;


