import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload } from "lucide-react";
import { toast } from "sonner";

interface FileUploaderProps {
  label: string;
  accept: string;
  onFileLoad: (content: string) => void;
  icon?: React.ReactNode;
}

export const FileUploader = ({ label, accept, onFileLoad, icon }: FileUploaderProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      onFileLoad(content);
      toast.success(`${label} loaded successfully`);
    };
    reader.onerror = () => {
      toast.error(`Error loading ${label}`);
    };
    reader.readAsText(file);
  };

  return (
    <Card className="p-6 bg-card border-border hover:border-primary transition-colors">
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
      <Button
        onClick={() => fileInputRef.current?.click()}
        className="w-full bg-gradient-primary hover:opacity-90 transition-opacity"
        size="lg"
      >
        {icon || <Upload className="mr-2 h-5 w-5" />}
        {label}
      </Button>
    </Card>
  );
};
