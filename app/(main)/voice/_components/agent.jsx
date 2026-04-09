"use client";

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils.js';
import { useRouter } from 'next/navigation';
import { vapi } from '@/lib/vapi.sdk';
import { createVoiceFeedback } from '@/actions/voice';
import { interviewer } from '@/lib/vapi.constants';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Phone, PhoneOff, Mic2, Bot, User } from 'lucide-react';

const CallStatus = {
    INACTIVE: 'INACTIVE',
    CONNECTING: 'CONNECTING',
    ACTIVE: 'ACTIVE',
    FINISHED: 'FINISHED',
};

const Agent = ({ userName, userId, type, interviewId, questions }) => {
    const router = useRouter();
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [callStatus, setCallStatus] = useState(CallStatus.INACTIVE);
    const [messages, setMessages] = useState([]);
    const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);

    const messagesRef = useRef([]);
    const feedbackGenerating = useRef(false);

    useEffect(() => {
        const onCallStart = () => setCallStatus(CallStatus.ACTIVE);
        const onCallEnd = () => setCallStatus(CallStatus.FINISHED);

        const onMessage = (message) => {
            if (message.type === 'transcript' && message.transcriptType === 'final') {
                const newMessage = { role: message.role, content: message.transcript };
                setMessages((prev) => {
                    const updated = [...prev, newMessage];
                    messagesRef.current = updated;
                    return updated;
                });
            }
        };

        const onSpeechStart = () => setIsSpeaking(true);
        const onSpeechEnd = () => setIsSpeaking(false);
        const onError = (error) => console.log('Vapi Error:', error);

        vapi.on('call-start', onCallStart);
        vapi.on('call-end', onCallEnd);
        vapi.on('message', onMessage);
        vapi.on('speech-start', onSpeechStart);
        vapi.on('speech-end', onSpeechEnd);
        vapi.on('error', onError);

        return () => {
            vapi.off('call-start', onCallStart);
            vapi.off('call-end', onCallEnd);
            vapi.off('message', onMessage);
            vapi.off('speech-start', onSpeechStart);
            vapi.off('speech-end', onSpeechEnd);
            vapi.off('error', onError);
        };
    }, []);

    useEffect(() => {
        const handleFinished = async () => {
            if (type === 'generate') {
                router.push('/voice');
                return;
            }

            if (feedbackGenerating.current) return;
            feedbackGenerating.current = true;
            setIsGeneratingFeedback(true);

            const currentMessages = messagesRef.current;

            if (currentMessages.length === 0) {
                feedbackGenerating.current = false;
                setIsGeneratingFeedback(false);
                router.push('/voice');
                return;
            }

            const { success, feedbackId } = await createVoiceFeedback({
                interviewId,
                userId,
                transcript: currentMessages,
            });

            setIsGeneratingFeedback(false);

            if (success && feedbackId) {
                router.push(`/voice/vinterview/${interviewId}/feedback`);
            } else {
                feedbackGenerating.current = false;
                router.push('/voice');
            }
        };

        if (callStatus === CallStatus.FINISHED) {
            handleFinished();
        }
    }, [callStatus]);

    const handleCall = async () => {
        setCallStatus(CallStatus.CONNECTING);

        if (type === 'generate') {
            await vapi.start(process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID, {
                variableValues: {
                    username: userName,
                    userid: userId,
                },
            });
        } else {
            const formattedQuestions = questions?.map((q) => `- ${q}`).join('\n') ?? '';
            await vapi.start(interviewer, {
                variableValues: {
                    questions: formattedQuestions,
                },
            });
        }
    };

    const handleDisconnect = () => {
        setCallStatus(CallStatus.FINISHED);
        vapi.stop();
    };

    const latestMessage = messages[messages.length - 1]?.content;
    const isCallInactiveOrFinished =
        callStatus === CallStatus.INACTIVE || callStatus === CallStatus.FINISHED;

    return (
        <div className="space-y-8 w-full max-w-4xl mx-auto">
            {/* Main Call View */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* AI Interviewer Card */}
                <Card className={cn(
                    "relative overflow-hidden transition-all duration-300",
                    isSpeaking ? "border-primary ring-1 ring-primary" : "border-border"
                )}>
                    <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                        <div className='relative'>
                            <div className={cn(
                                "p-6 rounded-full border-2 transition-all duration-500 bg-primary/5",
                                isSpeaking ? "border-green-500 scale-105" : "border-transparent"
                            )}>
                                <Bot className={cn(
                                    "h-16 w-16 text-primary transition-all",
                                    isSpeaking && "animate-pulse"
                                )} />
                            </div>
                            {isSpeaking && (
                                <span className='absolute -bottom-1 -right-1 bg-green-500 p-1.5 rounded-full shadow-lg'>
                                    <Mic2 className="h-4 w-4 text-white" />
                                </span>
                            )}
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold">AI Interviewer</h3>
                            <Badge variant="secondary" className="mt-1">Agent</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* User Card */}
                <Card className="border-border">
                    <CardContent className="flex flex-col items-center justify-center p-8 space-y-4">
                        <div className="p-6 rounded-full bg-muted border-2 border-border/50">
                            <User className="h-16 w-16 text-muted-foreground" />
                        </div>
                        <div className="text-center">
                            <h3 className="text-xl font-bold">{userName}</h3>
                            <Badge variant="outline" className="mt-1">Candidate</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Transcript Area */}
            {messages.length > 0 && (
                <Card className="bg-muted/30 border-dashed border-2">
                    <CardContent className="p-6 text-center">
                        <p className={cn(
                            'text-lg leading-relaxed text-foreground italic transition-opacity duration-500 animate-fadeIn'
                        )}>
                            "{latestMessage}"
                        </p>
                    </CardContent>
                </Card>
            )}

            {/* Status & Controls */}
            <div className="flex flex-col items-center gap-6">
                {isGeneratingFeedback && (
                    <div className='flex items-center gap-2 text-muted-foreground animate-pulse'>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <p className='text-sm font-medium'>Analyzing responses and generating feedback...</p>
                    </div>
                )}

                <div className='flex items-center gap-4'>
                    {callStatus !== CallStatus.ACTIVE ? (
                        <Button 
                            size="lg"
                            className="rounded-full px-10 h-14 text-lg font-semibold shadow-lg transition-all hover:scale-105"
                            onClick={handleCall}
                            disabled={callStatus === CallStatus.CONNECTING || isGeneratingFeedback}
                        >
                            {callStatus === CallStatus.CONNECTING ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Connecting
                                </>
                            ) : (
                                <>
                                    <Phone className="mr-2 h-5 w-5" />
                                    {isCallInactiveOrFinished ? 'Start Interview' : 'Reconnect'}
                                </>
                            )}
                        </Button>
                    ) : (
                        <Button 
                            variant="destructive"
                            size="lg"
                            className="rounded-full px-10 h-14 text-lg font-semibold shadow-lg animate-fadeIn"
                            onClick={handleDisconnect}
                        >
                            <PhoneOff className="mr-2 h-5 w-5" />
                            End Interview
                        </Button>
                    )}

                    {type === 'interview' &&
                        callStatus === CallStatus.FINISHED &&
                        !isGeneratingFeedback && (
                            <Button
                                variant="outline"
                                size="lg"
                                className='rounded-full h-14'
                                onClick={() => router.push(`/voice/vinterview/${interviewId}/feedback`)}
                            >
                                View Results
                            </Button>
                        )}
                </div>
            </div>
        </div>
    );
};

export default Agent;