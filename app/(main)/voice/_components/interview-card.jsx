"use client";

import React from 'react';
import dayjs from 'dayjs';
import Link from 'next/link';
import { 
  Card, 
  CardContent, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Calendar, 
  ChevronRight, 
  ClipboardCheck, 
  Clock, 
  Trophy 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const InterviewCard = ({ id, userId, role, type, techstack, createdAt, feedback }) => {
    const normalizedType = /mix/gi.test(type) ? "Mixed" : type;
    const formattedDate = dayjs(feedback?.createdAt || createdAt || Date.now()).format('MMM D, YYYY');
    
    const isTaken = !!feedback;

    return (
      <Card className="flex flex-col h-full hover:border-primary/50 transition-colors duration-300">
        <CardHeader className="pb-3">
            <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary" className="font-semibold uppercase tracking-wider text-[10px]">
                    {normalizedType}
                </Badge>
                {isTaken && (
                    <div className="flex items-center gap-1 text-green-500">
                        <Trophy className="h-4 w-4" />
                        <span className="text-sm font-bold">{feedback.totalScore}/100</span>
                    </div>
                )}
            </div>
            <CardTitle className="text-xl capitalize leading-tight">
                {role} <span className="text-muted-foreground font-normal">Interview</span>
            </CardTitle>
        </CardHeader>

        <CardContent className="grow">
            <div className="flex flex-col gap-4">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formattedDate}
                    </div>
                    <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        15-20 Mins
                    </div>
                </div>

                <div className="flex flex-wrap gap-1.5">
                    {techstack?.slice(0, 4).map((tech) => (
                        <span key={tech} className="text-[11px] px-2 py-0.5 bg-muted rounded-md text-muted-foreground border border-border/50">
                            {tech}
                        </span>
                    ))}
                    {techstack?.length > 4 && <span className="text-[11px] text-muted-foreground">+{techstack.length - 4} more</span>}
                </div>

                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mt-2 border-l-2 border-muted pl-3">
                    {feedback?.finalAssessment || "Ready to begin your practice session? Start now to receive an AI-powered evaluation."}
                </p>
            </div>
        </CardContent>

        <CardFooter className="pt-0">
            <Button 
                className={cn(
                    "w-full transition-all group",
                    isTaken ? "variant-outline border-primary/20 hover:bg-primary/10" : "btn-primary"
                )}
                asChild
            >
                <Link href={isTaken
                    ? `/voice/vinterview/${id}/feedback`
                    : `/voice/vinterview/${id}`
                }> 
                    {isTaken ? "Review Performance" : "Begin Assessment"}
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </Button>
        </CardFooter>
      </Card>
    )
}

export default InterviewCard;