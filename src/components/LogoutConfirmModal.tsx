"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, LogOut } from "lucide-react";

interface LogoutConfirmModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
}

export default function LogoutConfirmModal({
    open,
    onOpenChange,
    onConfirm,
}: LogoutConfirmModalProps) {
    const handleLogout = () => {
        onConfirm();
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md overflow-hidden bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                        Are You Sure? 🥺
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 py-4">
                    {/* Animated GIF Section */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex justify-center"
                    >
                        <div className="relative">
                            <motion.div
                                animate={{ rotate: [0, -5, 5, -5, 0] }}
                                transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
                                className="w-48 h-48 rounded-2xl overflow-hidden shadow-2xl border-4 border-white"
                            >
                                <img
                                    src="https://media.giphy.com/media/l4FGGafcOHmrlQxG0/giphy.gif"
                                    alt="No no no"
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        // Fallback to a different GIF if the first one fails
                                        e.currentTarget.src = "https://media.giphy.com/media/STfLOU6iRBRunMciZv/giphy.gif";
                                    }}
                                />
                            </motion.div>

                            {/* Floating hearts animation */}
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ y: 0, opacity: 1 }}
                                    animate={{
                                        y: -100,
                                        opacity: 0,
                                        x: Math.random() * 40 - 20
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: Infinity,
                                        delay: i * 0.4,
                                        ease: "easeOut"
                                    }}
                                    className="absolute bottom-0 left-1/2 text-2xl"
                                    style={{ left: `${20 + i * 15}%` }}
                                >
                                    💔
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Message */}
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-center space-y-2"
                    >
                        <p className="text-xl font-semibold text-gray-800">
                            Don't leave us! 😢
                        </p>
                        <p className="text-gray-600">
                            We'll miss you! Are you absolutely sure you want to logout?
                        </p>
                    </motion.div>

                    {/* Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                onClick={() => onOpenChange(false)}
                                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-6 text-lg shadow-lg"
                            >
                                <motion.span
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ duration: 1, repeat: Infinity }}
                                    className="mr-2"
                                >
                                    ❤️
                                </motion.span>
                                No, Stay!
                            </Button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                onClick={handleLogout}
                                variant="outline"
                                className="w-full border-2 border-gray-300 hover:bg-gray-100 text-gray-700 font-semibold py-6 text-lg"
                            >
                                <LogOut className="w-5 h-5 mr-2" />
                                Yes, Logout
                            </Button>
                        </motion.div>
                    </div>

                    {/* Pleading message */}
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.5 }}
                        className="text-center text-sm text-gray-500 italic"
                    >
                        Please don't go... 🥺👉👈
                    </motion.p>
                </div>
            </DialogContent>
        </Dialog>
    );
}
