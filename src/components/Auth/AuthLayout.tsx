import { Link } from "react-router-dom";
import nikeImg from "../../assets/nike.png";

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({
  children,
  title,
  subtitle,
}) => {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding & Visual */}
      <div className="hidden lg:flex lg:w-[45%] bg-zinc-800 text-white p-12 flex-col justify-between relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] animate-pulse-slow" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-white/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>

        {/* Header / Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-block group">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                <span className="text-2xl font-black italic text-black">S</span>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter uppercase italic leading-none drop-shadow-lg">
                  ShoeStore
                </h1>
                <p className="text-xs text-neutral-300 tracking-widest uppercase font-bold drop-shadow-md">
                  Premium Sneakers
                </p>
              </div>
            </div>
          </Link>
        </div>

        {/* Main Visual - Floating Shoe */}
        <div className="relative z-10 flex-1 flex items-center justify-center perspective-1000">
          {/* Decorative Circles */}
          <div className="absolute w-[450px] h-[450px] border border-white/5 rounded-full animate-[spin_20s_linear_infinite]" />
          <div className="absolute w-[350px] h-[350px] border border-white/10 rounded-full animate-[spin_15s_linear_infinite_reverse]" />

          {/* Glowing Backdrop */}
          <div className="absolute w-[300px] h-[300px] bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-3xl" />

          {/* The Shoe */}
          <div className="relative z-20 animate-float">
            <img
              src={nikeImg}
              alt="Nike Air Jordan Monochrome"
              className="w-full max-w-[500px] object-contain drop-shadow-[0_35px_35px_rgba(0,0,0,0.5)] transform -rotate-[25deg] hover:rotate-[-15deg] hover:scale-110 transition-all duration-700 ease-out cursor-pointer"
            />

            {/* Shadow */}
            <div className="absolute -bottom-10 left-1/2 -translate-x-1/2 w-2/3 h-4 bg-black/40 blur-xl rounded-full animate-pulse-slow"></div>
          </div>

          {/* Floating Cards/Badges */}
          <div className="absolute top-1/4 right-10 bg-white/10 backdrop-blur-md p-3 rounded-xl border border-white/10 animate-bounce-slow">
            <div className="text-xs text-neutral-300">New Arrival</div>
            <div className="font-bold text-white">Air Jordan 1</div>
          </div>
        </div>

        {/* Footer / Tagline */}
        <div className="relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            <span className="text-neutral-500 text-sm uppercase tracking-widest">
              Since 2024
            </span>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold leading-tight">
            <span className="text-white">Walk with</span>{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-neutral-400 italic">
              Confidence
            </span>
          </h2>
          <p className="mt-4 text-neutral-400 max-w-md text-lg font-light">
            Khám phá bộ sưu tập giày thể thao độc quyền. Nâng tầm phong cách của
            bạn ngay hôm nay.
          </p>
        </div>
      </div>

      {/* Right Side - Auth Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 bg-slate-50 relative">
        {/* Mobile Background Pattern */}
        <div className="absolute inset-0 lg:hidden bg-slate-900 overflow-hidden">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-white rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-neutral-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
        </div>

        <div className="w-full max-w-lg relative z-10">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-block group">
              <div className="flex items-center justify-center gap-3">
                <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                  <span className="text-2xl font-black italic text-white">
                    S
                  </span>
                </div>
                <div className="text-left">
                  <h1 className="text-2xl font-black tracking-tighter uppercase italic leading-none text-black">
                    ShoeStore
                  </h1>
                  <p className="text-xs text-neutral-500 tracking-widest uppercase">
                    Premium Sneakers
                  </p>
                </div>
              </div>
            </Link>
          </div>

          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
            {/* Welcome Text */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
              <p className="text-slate-500 mt-2">{subtitle}</p>
            </div>

            {/* Form Content */}
            {children}

            {/* Back to home */}
            <div className="text-center mt-6">
              <Link
                to="/"
                className="text-slate-500 hover:text-black transition-colors inline-flex items-center gap-2 font-medium"
              >
                ← Quay lại trang chủ
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
