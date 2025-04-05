import { useState, useRef, useEffect } from "react";
import { Circle, Download, Video, StopCircle, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface CallRecordingProps {
  isCallActive: boolean;
  localStream?: MediaStream;
  remoteStream?: MediaStream;
}

export default function CallRecording({ isCallActive, localStream, remoteStream }: CallRecordingProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);
  const [recordingUrl, setRecordingUrl] = useState<string | null>(null);
  const [showRecordingDialog, setShowRecordingDialog] = useState(false);
  const [recordingName, setRecordingName] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingProgress, setProcessingProgress] = useState(0);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<number | null>(null);

  // Format recording time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start call recording
  const startRecording = () => {
    if (!isCallActive || !localStream || !remoteStream) {
      console.error("Cannot start recording: call not active or streams not available");
      return;
    }
    
    try {
      // Create a new stream that combines local and remote streams
      const canvas = document.createElement('canvas');
      canvas.width = 640;
      canvas.height = 480;
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        console.error("Failed to get canvas context");
        return;
      }
      
      // Create a stream from the canvas
      // @ts-ignore (older browsers may not support this)
      const canvasStream = canvas.captureStream(30); // 30 FPS
      
      // Get audio tracks from both streams
      const localAudioTrack = localStream.getAudioTracks()[0];
      const remoteAudioTrack = remoteStream.getAudioTracks()[0];
      
      // Add audio tracks to canvas stream
      if (localAudioTrack) canvasStream.addTrack(localAudioTrack);
      if (remoteAudioTrack) canvasStream.addTrack(remoteAudioTrack);
      
      // Draw frames to canvas
      const drawVideoFrame = () => {
        if (!isRecording) return;
        
        // Get video elements
        const localVideo = document.querySelector<HTMLVideoElement>('[data-testid="local-video"]');
        const remoteVideo = document.querySelector<HTMLVideoElement>('[data-testid="remote-video"]');
        
        if (ctx && localVideo && remoteVideo) {
          // Draw remote video as background (large)
          ctx.drawImage(remoteVideo, 0, 0, canvas.width, canvas.height);
          
          // Draw local video as picture-in-picture (small, in corner)
          const pipWidth = canvas.width / 4;
          const pipHeight = canvas.height / 4;
          ctx.drawImage(
            localVideo, 
            canvas.width - pipWidth - 10,
            canvas.height - pipHeight - 10,
            pipWidth,
            pipHeight
          );
          
          // Add recording indicator
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fillRect(10, 10, 100, 30);
          ctx.fillStyle = '#ff0000';
          ctx.fillRect(20, 20, 10, 10);
          ctx.fillStyle = '#ffffff';
          ctx.font = '14px Arial';
          ctx.fillText('REC ' + formatTime(recordingTime), 40, 30);
        }
        
        if (isRecording) {
          requestAnimationFrame(drawVideoFrame);
        }
      };
      
      // Set up MediaRecorder
      const options = { mimeType: 'video/webm;codecs=vp9,opus' };
      mediaRecorderRef.current = new MediaRecorder(canvasStream, options);
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          setRecordedChunks(prev => [...prev, event.data]);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(recordedChunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        setRecordingUrl(url);
        setShowRecordingDialog(true);
        setRecordingName(`Call_Recording_${new Date().toISOString().substring(0, 10)}`);
        setIsProcessing(true);
        
        // Simulate processing
        let progress = 0;
        const processingInterval = setInterval(() => {
          progress += 5;
          setProcessingProgress(progress);
          if (progress >= 100) {
            clearInterval(processingInterval);
            setIsProcessing(false);
          }
        }, 200);
      };
      
      // Start recording
      mediaRecorderRef.current.start(1000); // Collect data every second
      setIsRecording(true);
      setRecordedChunks([]);
      setRecordingTime(0);
      
      // Start timer
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      // Start drawing frames
      drawVideoFrame();

    } catch (error) {
      console.error("Error starting recording:", error);
    }
  };

  // Stop call recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsRecording(false);
  };

  // Download recording
  const downloadRecording = () => {
    if (recordingUrl) {
      const a = document.createElement('a');
      document.body.appendChild(a);
      a.style.display = 'none';
      a.href = recordingUrl;
      a.download = `${recordingName || 'recording'}.webm`;
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
      }, 100);
    }
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      
      if (recordingUrl) {
        URL.revokeObjectURL(recordingUrl);
      }
    };
  }, [recordingUrl]);

  // Reset recording when call changes
  useEffect(() => {
    if (!isCallActive && isRecording) {
      stopRecording();
    }
  }, [isCallActive]);

  return (
    <>
      {isCallActive && (
        <div className="flex items-center gap-2">
          {isRecording ? (
            <Button 
              variant="destructive"
              size="sm" 
              onClick={stopRecording} 
              className="flex items-center gap-1.5"
            >
              <StopCircle className="h-4 w-4" />
              <span>{formatTime(recordingTime)}</span>
            </Button>
          ) : (
            <Button 
              variant="outline"
              size="sm" 
              onClick={startRecording}
              className="flex items-center gap-1.5"
            >
              <Circle className="h-4 w-4 fill-red-500 text-red-500" />
              Record Call
            </Button>
          )}
        </div>
      )}
      
      <Dialog open={showRecordingDialog} onOpenChange={setShowRecordingDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Call Recording</DialogTitle>
            <DialogDescription>
              Your call recording is ready to save
            </DialogDescription>
          </DialogHeader>
          
          {isProcessing ? (
            <div className="space-y-4 py-4">
              <div className="flex items-center justify-center">
                <Clock className="h-12 w-12 text-muted-foreground animate-pulse" />
              </div>
              <h3 className="text-center font-medium">Processing recording...</h3>
              <Progress value={processingProgress} className="h-2" />
              <p className="text-center text-sm text-muted-foreground">
                Please wait while we process your recording
              </p>
            </div>
          ) : (
            <>
              <div className="aspect-video rounded-md overflow-hidden border bg-muted">
                {recordingUrl && (
                  <video
                    src={recordingUrl}
                    controls
                    className="w-full h-full"
                  />
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-medium">Recording Details</h3>
                    <p className="text-sm text-muted-foreground">
                      Duration: {formatTime(recordingTime)}
                    </p>
                  </div>
                  <Badge variant="outline" className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Ready
                  </Badge>
                </div>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <input
                      type="text"
                      value={recordingName}
                      onChange={(e) => setRecordingName(e.target.value)}
                      className="w-full px-3 py-2 border rounded text-sm"
                      placeholder="Recording name"
                    />
                  </div>
                  <Button onClick={downloadRecording} className="w-full flex items-center gap-1">
                    <Download className="h-4 w-4" />
                    Save
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}