import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

export function PdfViewer({ url, title, open, onOpenChange }: {
  url: string | null; title: string; open: boolean; onOpenChange: (o: boolean) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl h-[85vh] p-0 flex flex-col">
        <DialogHeader className="border-b p-4">
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
          {url ? (
            <iframe src={url} title={title} className="h-full w-full" />
          ) : (
            <div className="flex h-full items-center justify-center p-8 text-center text-sm text-muted-foreground">
              No PDF uploaded yet. An admin can upload one from the Admin Panel.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
