# Frontend - Website Kinh Doanh Sản Phẩm Giày

## 👨‍🎓 Thông tin sinh viên

**Sinh viên thực hiện:** Trần Ngọc Biên - 21110140  
**Tên đề tài:** XÂY DỰNG WEBSITE KINH DOANH SẢN PHẨM GIÀY

## 📋 Mô tả dự án

Đây là phần Frontend của website thương mại điện tử chuyên kinh doanh sản phẩm giày, được xây dựng với React, TypeScript và Vite.

## 🚀 Công nghệ sử dụng

- **Framework:** React 18.3.1
- **Language:** TypeScript 5.6.2
- **Build Tool:** Vite 6.0.5
- **Styling:** TailwindCSS 3.4.17
- **Routing:** React Router DOM 7.1.1
- **State Management:** React Context API
- **HTTP Client:** Axios 1.8.4
- **Real-time:** Socket.IO Client 4.8.1
- **Charts:** Chart.js 4.4.9, Recharts (MUI X-Charts)
- **Notifications:** React Hot Toast, React Toastify
- **Utilities:** Lodash, Date-fns, JWT-decode, JS-Cookie

## 📁 Cấu trúc dự án

```
Frontend_ShoeShop_KLTN/
├── public/
│   └── image/              # Static images
├── src/
│   ├── assets/             # Images, icons, fonts
│   ├── components/         # React components
│   │   ├── Admin/          # Admin dashboard components
│   │   ├── Auth/           # Authentication components
│   │   ├── Blog/           # Blog components
│   │   ├── Cart/           # Shopping cart
│   │   ├── Chat/           # AI Chatbot & Live chat
│   │   ├── Compare/        # Product comparison
│   │   ├── Custom/         # Custom reusable components
│   │   ├── Layout/         # Layout components
│   │   ├── Modal/          # Modal dialogs
│   │   ├── Navbar/         # Navigation bar
│   │   ├── ProductCard/    # Product card display
│   │   ├── ProductDetail/  # Product detail view
│   │   ├── Review/         # Product reviews
│   │   ├── Skeleton/       # Loading skeletons
│   │   ├── UI/             # UI primitives
│   │   └── User/           # User profile components
│   ├── contexts/           # React Context providers
│   │   └── CompareContext.tsx
│   ├── hooks/              # Custom React hooks
│   │   └── useAuth.tsx
│   ├── pages/              # Page components
│   │   ├── AdminPages/     # Admin pages
│   │   ├── AuthPages/      # Login, Register, etc.
│   │   ├── MainPages/      # Home, Shop, Product pages
│   │   ├── ShipperPages/   # Shipper management
│   │   └── ...             # Other pages
│   ├── routers/            # Routing configuration
│   │   ├── Router.tsx
│   │   └── layout/
│   ├── services/           # API services
│   │   ├── AuthService.ts
│   │   ├── ProductService.ts
│   │   ├── CartService.ts
│   │   ├── OrderService.ts
│   │   ├── ChatService.ts
│   │   └── ...             # 30+ services
│   ├── types/              # TypeScript type definitions
│   │   ├── api.ts
│   │   ├── auth.ts
│   │   ├── product.ts
│   │   └── ...
│   ├── utils/              # Utility functions
│   ├── App.tsx             # Main App component
│   ├── main.tsx            # Entry point
│   └── index.css           # Global styles
├── .env                    # Environment variables
├── index.html              # HTML template
├── package.json            # Dependencies
├── tailwind.config.js      # TailwindCSS config
├── tsconfig.json           # TypeScript config
├── vite.config.ts          # Vite config
└── README.md
```

## 🔧 Cài đặt và triển khai

### Yêu cầu hệ thống

- Node.js >= 18.x
- npm hoặc yarn
- Git

### Bước 1: Clone repository

```bash
git clone https://github.com/tran-bien/Frontend_ShoeShop.git
```

### Bước 2: Di chuyển vào thư mục dự án

```bash
cd Frontend_ShoeShop_KLTN
```

### Bước 3: Cài đặt dependencies

```bash
npm install
```

### Bước 4: Thiết lập biến môi trường

Tạo file `.env` trong thư mục gốc của dự án:

```env
# Backend API URL
VITE_API_URL=http://localhost:5005
```

> **Lưu ý:** Với Vite, tất cả biến môi trường phải bắt đầu với prefix `VITE_`

### Bước 5: Chạy ứng dụng

**Development mode:**

```bash
npm run dev
```

**Build for production:**

```bash
npm run build
```

**Preview production build:**

```bash
npm run preview
```

**Lint code:**

```bash
npm run lint
```

Ứng dụng sẽ chạy tại: `http://localhost:5173`