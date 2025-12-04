import ForgotPasswordForm from "../../components/Auth/ForgotPasswordForm";

const ForgotPasswordPage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      {/* Header */}
      <header className="absolute top-4 left-6 flex items-center">
        {/*<img className="w-14 h-14" src="/image/logo.png" alt="logo" />*/}
        {/*<h1
          style={{
            fontFamily: "'Lobster', cursive",
            fontSize: "3rem",
            color: "black",
          }} // Tăng kích thước chữ và đổi màu
          className="text-2xl"
        >
          ShoeStore
        </h1>*/}
      </header>

      {/* Form Quên Mật Khẩu */}
      <ForgotPasswordForm />
    </div>
  );
};

export default ForgotPasswordPage;

