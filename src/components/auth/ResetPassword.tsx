import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Lock, 
  Key, 
  Shield, 
  Eye, 
  EyeOff, 
  Sparkles, 
  Zap,
  CheckCircle,
  ArrowLeft
} from "lucide-react";
import { verifyResetTokenAPI, resetPasswordAPI } from "../../api/api";
import { errorNotification, successNotification } from "../../helpers/notifi_helper";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [isValid, setIsValid] = useState(false);
    const [loading, setLoading] = useState(true);
    const [resetting, setResetting] = useState(false);
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [particles, setParticles] = useState([]);
    const [isHovered, setIsHovered] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    // Particle effect
    useEffect(() => {
        const particlesArray = Array.from({ length: 15 }, (_, i) => ({
            id: i,
            x: Math.random() * 100,
            y: Math.random() * 100,
            size: Math.random() * 3 + 1,
            duration: Math.random() * 10 + 8,
            delay: Math.random() * 5,
        }));
        setParticles(particlesArray);
    }, []);

    // Password strength calculator
    useEffect(() => {
        let strength = 0;
        if (password.length >= 8) strength += 25;
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[0-9]/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;
        setPasswordStrength(strength);
    }, [password]);

    useEffect(() => {
        const verify = async () => {
            try {
                const res = await verifyResetTokenAPI(token);
                if (res?.success) {
                    setIsValid(true);
                    successNotification("Reset link verified successfully");
                } else {
                    throw new Error("Invalid token");
                }
            } catch {
                errorNotification("Invalid or expired reset link");
                setTimeout(() => navigate("/forgot-password"), 2000);
            } finally {
                setLoading(false);
            }
        };
        verify();
    }, [token, navigate]);

    const handleReset = async (e) => {
        e.preventDefault();
        if (!password.trim()) {
            return errorNotification("Please enter a new password");
        }

        if (passwordStrength < 75) {
            return errorNotification("Please use a stronger password");
        }

        try {
            setResetting(true);
            const res = await resetPasswordAPI({ token, newPassword: password });
            if (res?.success) {
                successNotification("Password reset successfully! Redirecting...");
                setTimeout(() => navigate("/"), 1500);
            } else {
                throw new Error(res?.message || "Failed to reset password");
            }
        } catch (err) {
            errorNotification(err.message || "Failed to reset password");
        } finally {
            setResetting(false);
        }
    };

    const getStrengthColor = () => {
        if (passwordStrength >= 75) return "from-green-500 to-emerald-400";
        if (passwordStrength >= 50) return "from-yellow-500 to-amber-400";
        if (passwordStrength >= 25) return "from-orange-500 to-yellow-400";
        return "from-red-500 to-orange-400";
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-gray-900 to-black text-gray-100 relative overflow-hidden">
                {/* Loading Animation */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                >
                    <motion.div
                        animate={{ rotate: 360, scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                        className="w-16 h-16 bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl mx-auto mb-4 flex items-center justify-center"
                    >
                        <Shield className="w-8 h-8 text-white" />
                    </motion.div>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-gray-400 flex items-center gap-2"
                    >
                        <Zap className="w-4 h-4 text-orange-400" />
                        Verifying reset link...
                    </motion.p>
                </motion.div>
            </div>
        );
    }

    if (!isValid) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-gray-900 to-black text-gray-100">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <div className="w-16 h-16 bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
                        <Key className="w-8 h-8 text-white" />
                    </div>
                    <p className="text-gray-400">Redirecting to password recovery...</p>
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-zinc-950 via-gray-900 to-black text-gray-100 relative overflow-hidden">
            
            {/* 🌟 Background Particles */}
            <div className="absolute inset-0 overflow-hidden">
                {particles.map((particle) => (
                    <motion.div
                        key={particle.id}
                        className="absolute bg-gradient-to-r from-green-500/15 to-emerald-400/15 rounded-full"
                        initial={{
                            x: `${particle.x}vw`,
                            y: `${particle.y}vh`,
                            opacity: 0,
                        }}
                        animate={{
                            x: [`${particle.x}vw`, `${particle.x + 6}vw`, `${particle.x}vw`],
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

            {/* 🔥 Floating Icons */}
            <div className="absolute inset-0 pointer-events-none">
                <motion.div
                    className="absolute top-1/4 left-1/4 text-green-500/10"
                    animate={{ rotate: 360, y: [0, -10, 0] }}
                    transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Shield size={36} />
                </motion.div>
                <motion.div
                    className="absolute bottom-1/3 right-1/4 text-emerald-500/10"
                    animate={{ rotate: -360, scale: [1, 1.1, 1] }}
                    transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
                >
                    <Key size={32} />
                </motion.div>
            </div>

            {/* 🟢 Dynamic Background Glow */}
            <motion.div 
                className="absolute inset-0 bg-gradient-to-br from-green-600/5 via-emerald-500/3 to-teal-400/2"
                animate={{
                    background: [
                        "radial-gradient(circle at 30% 70%, rgba(34,197,94,0.1) 0%, transparent 50%)",
                        "radial-gradient(circle at 70% 30%, rgba(16,185,129,0.1) 0%, transparent 50%)",
                        "radial-gradient(circle at 50% 50%, rgba(5,150,105,0.1) 0%, transparent 50%)",
                        "radial-gradient(circle at 30% 70%, rgba(34,197,94,0.1) 0%, transparent 50%)",
                    ]
                }}
                transition={{ duration: 10, repeat: Infinity }}
            />

            {/* 🧱 Main Card */}
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
                    boxShadow: "0 0 60px rgba(34, 197, 94, 0.3)"
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
                    className="absolute -top-3 -right-3 bg-gradient-to-r from-green-600 to-emerald-500 p-3 rounded-full shadow-lg"
                >
                    <CheckCircle className="w-5 h-5 text-white" />
                </motion.div>

                {/* 🧠 Header */}
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
                        <div className="w-20 h-20 bg-gradient-to-tr from-green-600 via-emerald-500 to-teal-400 rounded-2xl shadow-[0_0_50px_rgba(34,197,94,0.6)] flex items-center justify-center relative overflow-hidden">
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
                            
                            <Key className="w-8 h-8 text-white" />
                        </div>
                    </motion.div>
                    
                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-3xl font-bold bg-gradient-to-r from-green-400 via-emerald-400 to-teal-400 bg-clip-text text-transparent tracking-tight mb-3"
                    >
                        New Password
                    </motion.h1>
                    
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="text-sm text-gray-400 flex items-center justify-center gap-2"
                    >
                        <Zap className="w-4 h-4 text-emerald-400" />
                        Create your new secure password
                        <Zap className="w-4 h-4 text-emerald-400" />
                    </motion.p>
                </div>

                {/* 🧾 Reset Form */}
                <motion.form 
                    onSubmit={handleReset} 
                    className="space-y-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    {/* Password Field */}
                    <motion.div
                        whileFocus={{ scale: 1.02 }}
                        className="group"
                    >
                        <label className="block text-sm font-medium text-gray-300 mb-3 ml-1">
                            New Password
                        </label>
                        <div className="relative">
                            <motion.div
                                className="flex items-center bg-zinc-800/60 border-2 border-zinc-700 rounded-xl px-4 py-3.5 group-focus-within:border-green-500 group-focus-within:bg-zinc-800/80 transition-all duration-300 backdrop-blur-sm"
                                whileHover={{ 
                                    borderColor: "rgb(34 197 94)",
                                    backgroundColor: "rgba(39, 39, 42, 0.8)"
                                }}
                            >
                                <Lock className="text-gray-400 w-5 h-5 mr-3 group-focus-within:text-green-400 transition-colors" />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter your new password"
                                    required
                                    autoComplete="new-password"
                                    className="bg-transparent outline-none w-full text-gray-100 placeholder-gray-500 text-lg font-medium tracking-wide"
                                />
                                <motion.button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="text-gray-400 hover:text-green-400 transition-colors p-1"
                                >
                                    {showPassword ? (
                                        <EyeOff className="w-5 h-5" />
                                    ) : (
                                        <Eye className="w-5 h-5" />
                                    )}
                                </motion.button>
                            </motion.div>
                        </div>

                        {/* Password Strength Meter */}
                        {password && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                className="mt-3"
                            >
                                <div className="flex justify-between text-xs mb-2">
                                    <span className="text-gray-400">Password strength</span>
                                    <span className={`font-medium ${
                                        passwordStrength >= 75 ? "text-green-400" :
                                        passwordStrength >= 50 ? "text-yellow-400" :
                                        passwordStrength >= 25 ? "text-orange-400" : "text-red-400"
                                    }`}>
                                        {passwordStrength >= 75 ? "Strong" :
                                         passwordStrength >= 50 ? "Medium" :
                                         passwordStrength >= 25 ? "Weak" : "Very Weak"}
                                    </span>
                                </div>
                                <div className="w-full bg-zinc-700 rounded-full h-2">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${passwordStrength}%` }}
                                        transition={{ duration: 0.5 }}
                                        className={`h-2 rounded-full bg-gradient-to-r ${getStrengthColor()}`}
                                    />
                                </div>
                            </motion.div>
                        )}
                    </motion.div>

                    {/* Requirements List */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.8 }}
                        className="text-xs text-gray-500 space-y-1"
                    >
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                                password.length >= 8 ? "bg-green-400" : "bg-zinc-600"
                            }`} />
                            At least 8 characters
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                                /[A-Z]/.test(password) ? "bg-green-400" : "bg-zinc-600"
                            }`} />
                            One uppercase letter
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                                /[0-9]/.test(password) ? "bg-green-400" : "bg-zinc-600"
                            }`} />
                            One number
                        </div>
                        <div className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full ${
                                /[^A-Za-z0-9]/.test(password) ? "bg-green-400" : "bg-zinc-600"
                            }`} />
                            One special character
                        </div>
                    </motion.div>

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        disabled={resetting || passwordStrength < 75}
                        whileHover={{ 
                            scale: (resetting || passwordStrength < 75) ? 1 : 1.05,
                            boxShadow: (resetting || passwordStrength < 75) ? "none" : "0 0 40px rgba(34, 197, 94, 0.6)"
                        }}
                        whileTap={{ scale: (resetting || passwordStrength < 75) ? 1 : 0.95 }}
                        className={`w-full py-4 rounded-xl font-bold text-lg tracking-wide text-white transition-all duration-300 relative overflow-hidden group ${
                            resetting || passwordStrength < 75
                                ? "bg-zinc-700 cursor-not-allowed"
                                : "bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-500 hover:to-emerald-400 shadow-lg"
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
                            {resetting ? (
                                <>
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
                                    />
                                    Resetting Password...
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    Reset Password
                                </>
                            )}
                        </span>
                    </motion.button>

                    {/* Back to Login */}
                    <motion.div 
                        className="text-center pt-4"
                        whileHover={{ scale: 1.05 }}
                    >
                        <button
                            type="button"
                            onClick={() => navigate("/")}
                            className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-green-300 transition-colors font-medium group"
                        >
                            <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-1" />
                            Back to Login
                        </button>
                    </motion.div>
                </motion.form>

                {/* 🔻 Security Footer */}
                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="text-center text-xs text-gray-500 mt-8 pt-6 border-t border-zinc-700/50"
                >
                    <div className="flex items-center justify-center gap-2 mb-2">
                        <Shield className="w-3 h-3 text-green-400" />
                        <span>Secure Password Reset</span>
                        <Shield className="w-3 h-3 text-green-400" />
                    </div>
                    <p>
                        © {new Date().getFullYear()}{" "}
                        <span className="text-green-400 font-semibold">Mecatronix</span> • 
                        Advanced Automation Systems
                    </p>
                </motion.div>
            </motion.div>

            {/* ✨ Background Glow Effect */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/30 pointer-events-none" />
        </div>
    );
};

export default ResetPassword;
