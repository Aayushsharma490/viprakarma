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
                    {/* Simplified Icon Section */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.3 }}
                        className="flex justify-center"
                    >
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl">
                            <LogOut className="w-12 h-12 text-white" />
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
                            Confirm Logout
                        </p>
                        <p className="text-gray-600">
                            Are you sure you want to logout from your account?
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
                                className="w-full bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white font-bold py-6 text-lg shadow-lg"
                            >
                                <X className="w-5 h-5 mr-2" />
                                Cancel
                            </Button>
                        </motion.div>

                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Button
                                onClick={handleLogout}
                                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold py-6 text-lg shadow-lg"
                            >
                                <LogOut className="w-5 h-5 mr-2" />
                                Logout
                            </Button>
                        </motion.div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
