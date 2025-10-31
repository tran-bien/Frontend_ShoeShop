import RegisterForm from "../../components/Auth/RegisterForm"; 

const RegisterPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      {/* Header */}
      <header className="absolute top-4 left-6 flex items-center">
        <img className="w-14 h-14" src="/image/logo.png" alt="logo" />
        <h1 className="text-2xl font-bold text-mono-black ml-2">TECHGROUP</h1>
      </header>

      {/* Nội dung chính */}
      <div className="w-full max-w-2xl text-center">
        {/* Tiêu đề */}
        <h2 className="text-4xl font-bold text-mono-900 mb-8">ĐĂNG KÝ</h2>

        {/* Form đăng ký */}
        <RegisterForm />
      </div>
    </div>
  );
};

export default RegisterPage;
