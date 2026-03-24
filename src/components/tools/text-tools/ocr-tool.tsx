"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Upload,
  Copy,
  Check,
  RotateCw,
  Loader2,
  ScanText,
  Clipboard,
  ClipboardCheck,
} from "lucide-react";
import { toast } from "sonner";
import Tesseract from "tesseract.js";

export function OcrTool() {
  const t = useTranslations("TextTools");
  const [image, setImage] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [language, setLanguage] = useState("eng");
  const [copied, setCopied] = useState(false);
  const [clipboardPasted, setClipboardPasted] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  const loadImageFromFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setImage(result);
      setText("");
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    loadImageFromFile(file);
  };

  const handlePasteFromClipboard = useCallback(async () => {
    try {
      const clipboardItems = await navigator.clipboard.read();
      for (const item of clipboardItems) {
        const imageType = item.types.find((t) => t.startsWith("image/"));
        if (imageType) {
          const blob = await item.getType(imageType);
          const reader = new FileReader();
          reader.onload = (e) => {
            const result = e.target?.result as string;
            setImage(result);
            setText("");
            setClipboardPasted(true);
            setTimeout(() => setClipboardPasted(false), 2000);
            toast.success("클립보드 이미지를 붙여넣었습니다.");
          };
          reader.readAsDataURL(blob);
          return;
        }
      }
      toast.error("클립보드에 이미지가 없습니다.", {
        description: "이미지를 복사한 뒤 다시 시도해주세요.",
      });
    } catch {
      toast.error("클립보드 접근 실패", {
        description:
          "브라우저 권한을 허용하거나 Ctrl+V로 직접 붙여넣기 해보세요.",
      });
    }
  }, []);

  // Global Ctrl+V listener
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const blob = item.getAsFile();
          if (!blob) continue;
          const reader = new FileReader();
          reader.onload = (ev) => {
            const result = ev.target?.result as string;
            setImage(result);
            setText("");
            setClipboardPasted(true);
            setTimeout(() => setClipboardPasted(false), 2000);
            toast.success("클립보드 이미지를 붙여넣었습니다.");
          };
          reader.readAsDataURL(blob);
          return;
        }
      }
    };
    window.addEventListener("paste", handleGlobalPaste);
    return () => window.removeEventListener("paste", handleGlobalPaste);
  }, []);

  const processImage = async () => {
    if (!image) {
      toast.error(t("OcrTool.errorNoImage"));
      return;
    }

    setLoading(true);
    setProgress(0);

    try {
      const result = await Tesseract.recognize(image, language, {
        logger: (m) => {
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });
      setText(result.data.text);
      toast.success(t("OcrTool.success"));
    } catch (error) {
      console.error(error);
      toast.error(t("OcrTool.error"));
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = () => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(t("OcrTool.copied"));
    setTimeout(() => setCopied(false), 2000);
  };

  const clearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    setImage(null);
    setText("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      {/* ── Left: Image Input ── */}
      <div className="space-y-4">
        {/* Top controls */}
        <div className="flex items-center justify-between gap-2">
          <Label className="text-sm font-medium">
            {t("OcrTool.inputLabel")}
          </Label>
          <div className="flex items-center gap-2">
            {/* Clipboard paste button */}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePasteFromClipboard}
              className="h-8 gap-1.5 text-xs rounded-lg border-dashed hover:border-primary/50 hover:text-primary transition-all"
            >
              {clipboardPasted ? (
                <ClipboardCheck className="h-3.5 w-3.5 text-emerald-500" />
              ) : (
                <Clipboard className="h-3.5 w-3.5" />
              )}
              <span className="hidden sm:inline">
                {clipboardPasted ? "붙여넣기 완료" : "클립보드 붙여넣기"}
              </span>
            </Button>
            {/* Language selector */}
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[110px] h-8 text-xs rounded-lg">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="eng">English</SelectItem>
                <SelectItem value="kor">한국어</SelectItem>
                <SelectItem value="jpn">日本語</SelectItem>
                <SelectItem value="chi_sim">中文</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Drop zone */}
        <div
          ref={dropZoneRef}
          className="relative border-2 border-dashed rounded-xl p-4 min-h-[300px] flex flex-col items-center justify-center bg-secondary/20 hover:bg-secondary/40 transition-colors cursor-pointer"
          onClick={() => !image && fileInputRef.current?.click()}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const file = e.dataTransfer.files?.[0];
            if (file?.type.startsWith("image/")) loadImageFromFile(file);
          }}
        >
          {image ? (
            <>
              <img
                src={image}
                alt="Preview"
                className="max-h-[400px] w-auto object-contain rounded-lg shadow-sm"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2 h-7 w-7 p-0 rounded-lg opacity-80 hover:opacity-100"
                onClick={clearAll}
              >
                <RotateCw className="h-3.5 w-3.5" />
              </Button>
            </>
          ) : (
            <div className="text-center space-y-3 px-4">
              <div className="flex justify-center gap-4">
                <Upload className="h-10 w-10 text-muted-foreground/40" />
                <Clipboard className="h-10 w-10 text-muted-foreground/40" />
              </div>
              <p className="text-muted-foreground font-medium text-sm">
                {t("OcrTool.dropLabel")}
              </p>
              <p className="text-xs text-muted-foreground/60 leading-relaxed">
                {t("OcrTool.dropSub")}
                <br />
                <span className="inline-flex items-center gap-1 mt-1">
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">
                    Ctrl
                  </kbd>
                  <span>+</span>
                  <kbd className="px-1.5 py-0.5 rounded bg-muted border border-border text-[10px] font-mono">
                    V
                  </kbd>
                  <span className="text-muted-foreground/70">
                    로 클립보드 이미지 붙여넣기
                  </span>
                </span>
              </p>
            </div>
          )}
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept="image/*"
            onChange={handleFileUpload}
          />
        </div>

        {/* Run button */}
        <Button
          className="w-full h-12 rounded-2xl gap-2 font-bold shadow-lg"
          onClick={processImage}
          disabled={!image || loading}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("OcrTool.processing")} {progress}%
            </>
          ) : (
            <>
              <ScanText className="h-4 w-4" />
              {t("OcrTool.processButton")}
            </>
          )}
        </Button>
      </div>

      {/* ── Right: Text Output ── */}
      <div className="space-y-4 flex flex-col">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">
            {t("OcrTool.outputLabel")}
          </Label>
          <Button
            size="sm"
            variant="ghost"
            onClick={copyToClipboard}
            disabled={!text}
            className="h-8 gap-1.5 text-xs"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
            {copied ? "복사됨" : "복사"}
          </Button>
        </div>
        <Textarea
          className="flex-1 font-mono text-sm resize-none bg-muted min-h-[350px]"
          value={text}
          readOnly
          placeholder={t("OcrTool.outputPlaceholder")}
        />
      </div>
    </div>
  );
}
