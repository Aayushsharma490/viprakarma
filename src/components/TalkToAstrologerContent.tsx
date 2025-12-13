'use client';

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    Star,
    Clock,
    Upload,
    Camera,
    MessageCircle,
    Phone,
    Video,
    Lock,
} from "lucide-react";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface Astrologer {
    id: number;
    name: string;
    specializations: string[];
    experience: number;
    rating: number;
    hourlyRate: number;
    bio: string;
    photo?: string;
    isOnline: boolean;
    isApproved: boolean;
    createdAt: string;
}

export default function TalkToAstrologerContent() {
    const [astrologers, setAstrologers] = useState<Astrologer[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { user, token, isLoading } = useAuth();
    const { t } = useLanguage();
    const router = useRouter();

    const [selectedAstrologer, setSelectedAstrologer] = useState<number | null>(
        null
    );
    const [chatStatus, setChatStatus] = useState<boolean>(false);
    const [activeSession, setActiveSession] = useState<{
        id: number;
        astrologerId: number;
        status: string;
    } | null>(null);

    useEffect(() => {
        fetchAstrologers();
        if (user?.id) {
            checkChatStatus();
        }
    }, [user, token]);

    const getAuthHeaders = (): Record<string, string> | undefined => {
        if (!token) return undefined;
        return { Authorization: `Bearer ${token}` };
    };

    const fetchAstrologers = async () => {
        try {
            const response = await fetch("/api/astrologers");
            if (!response.ok) {
                throw new Error("Failed to fetch astrologers");
            }
            const data = await response.json();
            // Filter to show only approved and online astrologers
            const filteredData = data.filter((astro: Astrologer) =>
                astro.isApproved && astro.isOnline
            );
            setAstrologers(filteredData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
            toast.error("Failed to load astrologers");
        } finally {
            setLoading(false);
        }
    };

    const checkChatStatus = async () => {
        try {
            const response = await fetch(`/api/user/chat-status?userId=${user?.id}`);
            if (response.ok) {
                const data = await response.json();
                setChatStatus(data.canChatWithAstrologer);
            }

            const headers = getAuthHeaders();
            if (headers) {
                const activeSessionResponse = await fetch(
                    "/api/chat/astrologer/start",
                    {
                        method: "GET",
                        headers,
                    }
                );

                if (activeSessionResponse.ok) {
                    const activeData = await activeSessionResponse.json();
                    if (activeData.session) {
                        setActiveSession({
                            id: activeData.session.id,
                            astrologerId: activeData.session.astrologerId,
                            status: activeData.session.status,
                        });
                    } else {
                        setActiveSession(null);
                    }
                }
            }
        } catch (error) {
            console.error("Error checking chat status:", error);
        }
    };

    const handleConnect = (panditId: number, type: "chat" | "call" | "video") => {
        if (!token) {
            toast.error("Please login to connect with a pandit");
            router.push("/login");
            return;
        }

        if (type === "chat" && activeSession) {
            if (
                activeSession.astrologerId === panditId &&
                activeSession.status === "active"
            ) {
                router.push(`/chat/astrologer?astrologer=${panditId}`);
                return;
            }

            if (
                activeSession.status === "active" &&
                activeSession.astrologerId !== panditId
            ) {
                toast.error(
                    "You already have an active chat session. Please complete it before starting another."
                );
                return;
            }
        }

        if (type === "chat" && chatStatus) {
            router.push(`/chat/astrologer?astrologer=${panditId}`);
            return;
        }

        // If chat not enabled yet, guide user into consultation payment flow
        if (type === "chat" && !chatStatus) {
            toast.info("Please complete consultation payment to unlock chat.");
        }

        // Set selected astrologer and redirect to consultation
        setSelectedAstrologer(panditId);
        router.push(`/consultation?astrologer=${panditId}&type=${type}`);
    };

    if (loading || isLoading) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12">
                    <div className="container mx-auto px-4">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">{t("astrologer.loading")}</p>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    if (error) {
        return (
            <>
                <Navbar />
                <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12">
                    <div className="container mx-auto px-4">
                        <div className="text-center">
                            <p className="text-red-600">{error}</p>
                            <Button onClick={fetchAstrologers} className="mt-4">
                                {t("astrologer.tryAgain")}
                            </Button>
                        </div>
                    </div>
                </div>
                <Footer />
            </>
        );
    }

    return (
        <>
            <Navbar />
            <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 py-12">
                <div className="container mx-auto px-4">
                    {/* Header */}
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-gray-900 mb-4">
                            {t("consultation.title")}
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                            {t("consultation.subtitle")}
                        </p>
                        {!chatStatus && (
                            <div className="mt-4 inline-flex items-center gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-amber-800 text-sm">
                                <Lock className="w-4 h-4" />
                                <span>{t("astrologer.chatLocked")}</span>
                            </div>
                        )}
                    </div>

                    {/* Astrologers Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {astrologers.map((astrologer) => (
                            <Card
                                key={astrologer.id}
                                className="bg-white/80 backdrop-blur-sm border-amber-200 hover:shadow-lg transition-shadow"
                            >
                                <CardHeader className="text-center">
                                    <Avatar className="w-20 h-20 mx-auto mb-4">
                                        <AvatarImage src={astrologer.photo} alt={astrologer.name} />
                                        <AvatarFallback className="bg-amber-100 text-amber-800 text-xl">
                                            {astrologer.name.charAt(0)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <CardTitle className="text-xl text-gray-900">
                                        {astrologer.name}
                                    </CardTitle>
                                    <CardDescription className="text-amber-700 font-medium">
                                        {Array.isArray(astrologer.specializations)
                                            ? astrologer.specializations.join(", ")
                                            : astrologer.specializations}
                                    </CardDescription>
                                    <div className="flex items-center justify-center gap-2 mt-2">
                                        <div className="flex items-center">
                                            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                            <span className="ml-1 text-sm font-medium">
                                                {astrologer.rating
                                                    ? astrologer.rating.toFixed(1)
                                                    : "New"}
                                            </span>
                                        </div>
                                        <span className="text-gray-400">•</span>
                                        <div className="flex items-center">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            <span className="ml-1 text-sm">
                                                {astrologer.experience} {t("astrologer.years")}
                                            </span>
                                        </div>
                                    </div>
                                </CardHeader>

                                <CardContent>
                                    <div className="space-y-4">
                                        <p className="text-gray-600 text-sm line-clamp-3">
                                            {astrologer.bio || t("astrologer.noBio")}
                                        </p>

                                        <div className="flex flex-wrap gap-1">
                                            {Array.isArray(astrologer.specializations) &&
                                                astrologer.specializations
                                                    .slice(0, 3)
                                                    .map((spec: string, index: number) => (
                                                        <Badge
                                                            key={index}
                                                            variant="secondary"
                                                            className="text-xs"
                                                        >
                                                            {spec.trim()}
                                                        </Badge>
                                                    ))}
                                        </div>

                                        <div className="flex items-center justify-between">
                                            <div className="text-sm text-gray-600">
                                                <span className="font-medium">
                                                    ₹{astrologer.hourlyRate}
                                                    {t("astrologer.perHour")}
                                                </span>
                                            </div>
                                            <Badge
                                                variant={astrologer.isOnline ? "default" : "secondary"}
                                            >
                                                {astrologer.isOnline
                                                    ? t("astrologer.online")
                                                    : t("astrologer.offline")}
                                            </Badge>
                                        </div>

                                        {/* Consultation Buttons */}
                                        <div className="mt-4 pt-4 border-t border-gray-200 space-y-2">

                                            <Button
                                                onClick={() => handleConnect(astrologer.id, "chat")}
                                                className={`w-full ${activeSession && activeSession.astrologerId === astrologer.id && activeSession.status === "active" ? "bg-green-600 hover:bg-green-700" : chatStatus ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400"} text-white`}
                                                size="sm"
                                                disabled={!chatStatus}
                                            >
                                                {activeSession &&
                                                    activeSession.astrologerId === astrologer.id &&
                                                    activeSession.status === "active" ? (
                                                    <MessageCircle className="w-4 h-4 mr-1" />
                                                ) : chatStatus ? (
                                                    <MessageCircle className="w-4 h-4 mr-1" />
                                                ) : (
                                                    <Lock className="w-4 h-4 mr-1" />
                                                )}
                                                {activeSession &&
                                                    activeSession.astrologerId === astrologer.id &&
                                                    activeSession.status === "active"
                                                    ? t("astrologer.continueChat")
                                                    : chatStatus
                                                        ? t("astrologer.chatNow")
                                                        : t("astrologer.startChatLocked")}
                                            </Button>

                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {astrologers.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-600">{t("astrologer.noAstrologers")}</p>
                        </div>
                    )}
                </div>
            </div>
            <Footer />
        </>
    );
}
