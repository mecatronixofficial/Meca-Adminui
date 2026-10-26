// ============================================
// 🌐 Mecatronix Admin Authentication (Frontend)
// ============================================

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  Shield,
  Sparkles,
  Zap,
  Globe,
  Cpu,
  Bot
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../../api/api";
import {
  errorNotification,
  successNotification,
} from "../../helpers/notifi_helper";
import { useDispatch } from "react-redux";
import { isLoginSuccess } from "../../redux/slices/authSlice";
import MecLogo from "../../assets/logos/Mec.webp";

const Auth = () => {
  // --------------------------------------------
  // 🔹 State Management
  // --------------------------------------------
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isHovered, setIsHovered] = useState(false);
  const [particles, setParticles] = useState([]);
  const navigate = useNavigate();
  const subtitles = ["Technology", "Automation", "Future"] as const;
  const [currentIndex, setCurrentIndex] = useState(0);
  const dispatch = useDispatch();

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % subtitles.length);
    }, 2000);
    return () => clearInterval(interval);
  }, [subtitles.length]);

  // --------------------------------------------
  // 🔮 Background Particles Effect
  // --------------------------------------------
  useEffect(() => {
    const particlesArray = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 10 + 10,
      delay: Math.random() * 5,
    }));
    setParticles(particlesArray);
  }, []);

  // --------------------------------------------
  // 🔐 Handle Login (Cookie-based Auth)
  // --------------------------------------------
  const handleLogin = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!formData.email.trim() || !formData.password.trim()) {
      return errorNotification("Email and password are required");
    }

    try {
      setLoading(true);

      // ✅ API call — axios handles cookies via withCredentials: true
      const res = await loginUser(formData);
      if (res?.success) {
        // ✅ Check if API response is valid
        const userData = {
          _id: res?.data?._id || res?.data?.id,
          name: res?.data?.name,
          email: res?.data?.email,
          role: res?.data?.role,
          phone: res?.data?.phone,
          img: res?.data?.img,
        };

        // ✅ Dispatch login success to Redux
        dispatch(isLoginSuccess(userData));

        successNotification(res?.message || "Welcome back! Access granted.");

        // Clear form
        setFormData({ email: "", password: "" });

        // Redirect after short delay
        setTimeout(() => navigate("/mec-admin", { replace: true }), 800);
      } else {
        throw new Error(res?.message || "Login failed");
      }
    } catch (err) {
      console.error("Login Error:", err);
      errorNotification(err, "Authentication failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------
  // 🎨 UI Layout
  // --------------------------------------------
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-gray-900 to-black text-gray-100 relative overflow-hidden">

      {/* 🌟 Animated Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute bg-gradient-to-r from-red-500/20 to-orange-400/20 rounded-full"
            initial={{
              x: `${particle.x}vw`,
              y: `${particle.y}vh`,
              opacity: 0,
            }}
            animate={{
              y: [`${particle.y}vh`, `${particle.y - 20}vh`, `${particle.y}vh`],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: particle.duration,
              delay: particle.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{
              width: particle.size,
              height: particle.size,
            }}
          />
        ))}
      </div>

      {/* 🔥 Floating Tech Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 text-red-500/10"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
        >
          <Globe size={40} />
        </motion.div>
        <motion.div
          className="absolute top-1/3 right-1/4 text-orange-500/10"
          animate={{ rotate: -360 }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        >
          <Cpu size={36} />
        </motion.div>
        <motion.div
          className="absolute bottom-1/4 left-1/3 text-yellow-500/10"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        >
          <Zap size={32} />
        </motion.div>
        <motion.div
          className="absolute bottom-1/3 right-1/3 text-red-500/10"
          animate={{ rotate: 180 }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        >
          <Bot size={44} />
        </motion.div>
      </div>

      {/* 🔴 Dynamic Background Glow */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-br from-red-600/5 via-orange-500/3 to-yellow-400/2"
        animate={{
          background: [
            "radial-gradient(circle at 20% 80%, rgba(239,68,68,0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 80% 20%, rgba(251,146,60,0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 40% 40%, rgba(234,179,8,0.1) 0%, transparent 50%)",
            "radial-gradient(circle at 20% 80%, rgba(239,68,68,0.1) 0%, transparent 50%)",
          ]
        }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      {/* 🧱 Login Card */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{
          duration: 0.8,
          type: "spring",
          stiffness: 100
        }}
        whileHover={{
          scale: 1.02,
          boxShadow: "0 0 60px rgba(239, 68, 68, 0.3)"
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative w-[90%] max-w-md bg-gradient-to-br from-zinc-900/90 to-zinc-800/80 backdrop-blur-2xl border border-zinc-700/50 rounded-3xl shadow-2xl p-8 transition-all duration-500 z-10"
      >

        {/* 🛡️ Security Badge */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="absolute -top-3 -right-3 bg-gradient-to-r from-red-600 to-orange-500 p-2 rounded-full shadow-lg"
        >
          <Shield className="w-5 h-5 text-white" />
        </motion.div>

        {/* 🧠 Branding Header */}
        <div className="text-center mb-2">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.3,
              type: "spring",
              stiffness: 200
            }}
            className="relative mx-auto mb-4"
          >
            <div className="w-20 h-20 bg-gradient-to-tr from-red-600 via-orange-500 to-yellow-400 rounded-2xl shadow-[0_0_50px_rgba(239,68,68,0.6)] flex items-center justify-center relative overflow-hidden">
              {/* Animated sparkles */}
              <AnimatePresence>
                {isHovered && (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    className="absolute inset-0"
                  >
                    <Sparkles className="w-6 h-6 text-white absolute top-1 left-1" />
                    <Sparkles className="w-4 h-4 text-white absolute bottom-1 right-1" />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.span
                className="text-2xl font-black text-white"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                M
              </motion.span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="w-full h-auto"
          >
            <div
              className="flex items-center gap-3 cursor-pointer group"
              onClick={() => navigate("/")}
            >
              <div className="h-14 w-auto flex items-center justify-center relative">
                <img
                  src={MecLogo}
                  alt="Mecatronix Logo"
                  className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                />
                <h1 className="text-lg font-semibold ">Mecatronix</h1>
                {/* SLIDING SUBTITLE */}
                <div className="absolute bottom-0 left-14 overflow-hidden w-[100px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentIndex}
                      initial={{ x: -60, opacity: 0 }}
                      animate={{ x: [0, -3, 3, -2, 2, 0], opacity: 1 }}
                      exit={{ x: 60, opacity: 0 }}
                      transition={{
                        duration: 0.6,
                        ease: "easeInOut",
                        rotate: { duration: 0.4, ease: "easeInOut" },
                      }}
                      className="text-[10px] text-gray-400 uppercase font-semibold tracking-wider"
                    >
                      {subtitles[currentIndex]}
                    </motion.div>
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-gray-400 mt-2 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 text-orange-400" />
            Secure Admin Portal
            <Zap className="w-4 h-4 text-orange-400" />
          </motion.p>
        </div>

        {/* 🧾 Login Form */}
        <motion.form
          onSubmit={handleLogin}
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {/* Email Field */}
          <motion.div
            whileFocus={{ scale: 1.02 }}
            className="group"
          >
            <label className="block text-sm font-medium text-gray-300 mb-3 ml-1">
              Email Address
            </label>
            <div className="relative">
              <motion.div
                className="flex items-center bg-zinc-800/60 border-2 border-zinc-700 rounded-xl px-4 py-3.5 group-focus-within:border-red-500 group-focus-within:bg-zinc-800/80 transition-all duration-300 backdrop-blur-sm"
                whileHover={{
                  borderColor: "rgb(249 115 22)",
                  backgroundColor: "rgba(39, 39, 42, 0.8)"
                }}
              >
                <Mail className="text-gray-400 w-5 h-5 mr-3 group-focus-within:text-red-400 transition-colors" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="admin@Mecatronix.com"
                  required
                  autoComplete="email"
                  className="bg-transparent outline-none w-full text-gray-100 placeholder-gray-500 text-lg font-medium tracking-wide"
                />
              </motion.div>
            </div>
          </motion.div>

          {/* Password Field */}
          <motion.div
            whileFocus={{ scale: 1.02 }}
            className="group"
          >
            <label className="block text-sm font-medium text-gray-300 mb-3 ml-1">
              Password
            </label>
            <div className="relative">
              <motion.div
                className="flex items-center bg-zinc-800/60 border-2 border-zinc-700 rounded-xl px-4 py-3.5 group-focus-within:border-red-500 group-focus-within:bg-zinc-800/80 transition-all duration-300 backdrop-blur-sm"
                whileHover={{
                  borderColor: "rgb(249 115 22)",
                  backgroundColor: "rgba(39, 39, 42, 0.8)"
                }}
              >
                <Lock className="text-gray-400 w-5 h-5 mr-3 group-focus-within:text-red-400 transition-colors" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Enter your password"
                  required
                  autoComplete="current-password"
                  className="bg-transparent outline-none w-full text-gray-100 placeholder-gray-500 text-lg font-medium tracking-wide"
                />
                <motion.button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="text-gray-400 hover:text-red-400 transition-colors p-1"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </motion.button>
              </motion.div>
            </div>
          </motion.div>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{
              scale: loading ? 1 : 1.05,
              boxShadow: loading ? "none" : "0 0 40px rgba(239, 68, 68, 0.6)"
            }}
            whileTap={{ scale: loading ? 1 : 0.95 }}
            className={`w-full py-4 rounded-xl font-bold text-lg tracking-wide text-white transition-all duration-300 relative overflow-hidden group ${loading
              ? "bg-zinc-700 cursor-not-allowed"
              : "bg-gradient-to-r from-red-600 to-orange-500 hover:from-red-500 hover:to-orange-400 shadow-lg"
              }`}
          >
            {/* Animated gradient overlay */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 transform"
              initial={{ x: "-100%" }}
              whileHover={{ x: "200%" }}
              transition={{ duration: 0.8 }}
            />

            <span className="relative z-10 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Authenticating...
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  Access Control Panel
                </>
              )}
            </span>
          </motion.button>

          {/* Forgot Password */}
          <motion.div
            className="text-center pt-2"
            whileHover={{ scale: 1.05 }}
          >
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-gray-400 hover:text-red-300 transition-colors font-medium"
            >
              Forgot your password?
            </button>
          </motion.div>
        </motion.form>

        {/* 🔻 Security Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-xs text-gray-500 mt-8 pt-4 border-t border-zinc-700/50"
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            <Shield className="w-3 h-3 text-green-400" />
            <span>Secure SSL Encryption</span>
            <Shield className="w-3 h-3 text-green-400" />
          </div>
          <p>
            © {new Date().getFullYear()}{" "}
            <span className="text-red-400 font-semibold">Mecatronix</span> •
            Advanced Automation Systems
          </p>
        </motion.div>
      </motion.div>

      {/* ✨ Background Glow Effect */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />
    </div>
  );
};

export default Auth;
