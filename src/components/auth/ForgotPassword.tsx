// ============================================
// 🔐 Mecatronix Forgot Password Page
// ============================================

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Mail, ArrowLeft, Shield, Sparkles, Zap, Key, Send } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { forgotPasswordAPI } from "../../api/api";
import {
  errorNotification,
  successNotification,
} from "../../helpers/notifi_helper";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [, setActiveField] = useState(false);
  const [particles, setParticles] = useState([]);
  const navigate = useNavigate();

  // Enhanced particle effect
  useEffect(() => {
    const particlesArray = Array.from({ length: 12 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      duration: Math.random() * 8 + 6,
      delay: Math.random() * 4,
    }));
    setParticles(particlesArray);
  }, []);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email.trim()) return errorNotification("Please enter your email");

    try {
      setLoading(true);
      const res = await forgotPasswordAPI(email);
      if (res?.success) {
        successNotification(res?.message || "Password reset link sent to your email!");
        setEmail("");
        setTimeout(() => navigate("/"), 2000);
      } else {
        throw new Error(res?.message || "Failed to send reset link");
      }
    } catch (err) {
      console.error("Forgot Password Error:", err);
      errorNotification(err, "Error sending password reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-gray-900 to-black text-gray-100 relative overflow-hidden">
      
      {/* 🌟 Enhanced Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute bg-gradient-to-r from-red-500/15 to-orange-400/15 rounded-full"
            initial={{
              x: `${particle.x}vw`,
              y: `${particle.y}vh`,
              opacity: 0,
            }}
            animate={{
              x: [`${particle.x}vw`, `${particle.x + 8}vw`, `${particle.x}vw`],
              y: [`${particle.y}vh`, `${particle.y - 25}vh`, `${particle.y}vh`],
              opacity: [0, 0.7, 0],
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

      {/* 🔥 Floating Icons */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute top-1/4 left-1/4 text-red-500/10"
          animate={{ rotate: 360, y: [0, -15, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        >
          <Key size={36} />
        </motion.div>
        <motion.div
          className="absolute bottom-1/3 right-1/4 text-orange-500/10"
          animate={{ rotate: -360, scale: [1, 1.1, 1] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        >
          <Shield size={32} />
        </motion.div>
        <motion.div
          className="absolute top-1/3 right-1/3 text-yellow-500/10"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 180, 360] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        >
          <Zap size={28} />
        </motion.div>
      </div>

      {/* 🔴 Dynamic Background Glow */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-br from-red-600/8 via-orange-500/5 to-yellow-400/3"
        animate={{
          background: [
            "radial-gradient(circle at 30% 70%, rgba(239,68,68,0.15) 0%, transparent 60%)",
            "radial-gradient(circle at 70% 30%, rgba(251,146,60,0.15) 0%, transparent 60%)",
            "radial-gradient(circle at 50% 50%, rgba(234,179,8,0.15) 0%, transparent 60%)",
            "radial-gradient(circle at 30% 70%, rgba(239,68,68,0.15) 0%, transparent 60%)",
          ]
        }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      {/* 🧱 Enhanced Main Card */}
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
          boxShadow: "0 0 80px rgba(239, 68, 68, 0.25)"
        }}
        onHoverStart={() => setIsHovered(true)}
        onHoverEnd={() => setIsHovered(false)}
        className="relative w-[90%] max-w-md bg-gradient-to-br from-zinc-900/95 to-zinc-800/90 backdrop-blur-2xl border border-zinc-700/50 rounded-3xl shadow-2xl p-8 transition-all duration-500 z-10"
      >
        
        {/* 🛡️ Security Badge */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: 0.5, type: "spring" }}
          className="absolute -top-3 -right-3 bg-gradient-to-r from-red-600 to-orange-500 p-3 rounded-full shadow-lg z-20"
        >
          <Shield className="w-5 h-5 text-white" />
        </motion.div>

        {/* 🧠 Enhanced Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: 0.3, 
              type: "spring", 
              stiffness: 200 
            }}
            className="relative mx-auto mb-6"
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
                    <Sparkles className="w-5 h-5 text-white absolute top-2 left-2" />
                    <Sparkles className="w-4 h-4 text-white absolute bottom-2 right-2" />
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
          
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl font-bold bg-gradient-to-r from-red-400 via-orange-400 to-yellow-400 bg-clip-text text-transparent tracking-tight mb-3"
          >
            Reset Your Password
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-sm text-gray-400 flex items-center justify-center gap-2"
          >
            <Zap className="w-4 h-4 text-orange-400" />
            Enter your email to receive a reset link
            <Zap className="w-4 h-4 text-orange-400" />
          </motion.p>
        </div>

        {/* 🧾 Enhanced Form */}
        <motion.form 
          onSubmit={handleForgotPassword} 
          className="space-y-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
        >
          {/* Enhanced Email Field */}
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
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setActiveField(true)}
                  onBlur={() => setActiveField(false)}
                  placeholder="admin@Mecatronix.com"
                  required
                  autoComplete="email"
                  className="bg-transparent outline-none w-full text-gray-100 placeholder-gray-500 text-lg font-medium tracking-wide"
                />
              </motion.div>
            </div>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-xs text-gray-500 mt-2 ml-1"
            >
              We'll send a secure password reset link to this email
            </motion.p>
          </motion.div>

          {/* Enhanced Submit Button */}
          <motion.button
            type="submit"
            disabled={loading}
            whileHover={{ 
              scale: loading ? 1 : 1.05,
              boxShadow: loading ? "none" : "0 0 40px rgba(239, 68, 68, 0.6)"
            }}
            whileTap={{ scale: loading ? 1 : 0.95 }}
            className={`w-full py-4 rounded-xl font-bold text-lg tracking-wide text-white transition-all duration-300 relative overflow-hidden group ${
              loading
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
            
            <span className="relative z-10 flex items-center justify-center gap-3">
              {loading ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                  />
                  Sending Reset Link...
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Send Reset Link
                </>
              )}
            </span>
          </motion.button>

          {/* Enhanced Back Button */}
          <motion.div 
            className="text-center pt-4"
            whileHover={{ scale: 1.05 }}
          >
            <button
              type="button"
              onClick={() => navigate("/")}
              className="inline-flex items-center gap-3 text-sm text-gray-400 hover:text-red-300 transition-colors font-medium group"
            >
              <motion.div
                whileHover={{ x: -3 }}
                transition={{ duration: 0.2 }}
              >
                <ArrowLeft className="w-4 h-4" />
              </motion.div>
              Back to Login
            </button>
          </motion.div>
        </motion.form>

        {/* 🔻 Enhanced Security Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-center text-xs text-gray-500 mt-10 pt-6 border-t border-zinc-700/50"
        >
          <div className="flex items-center justify-center gap-2 mb-3">
            <Shield className="w-3 h-3 text-green-400" />
            <span className="font-medium">Secure Password Recovery</span>
            <Shield className="w-3 h-3 text-green-400" />
          </div>
          <p className="text-gray-400/80">
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

export default ForgotPassword;
