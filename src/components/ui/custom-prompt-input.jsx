import * as React from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import * as DialogPrimitive from "@radix-ui/react-dialog";

function cn(...inputs) { return inputs.filter(Boolean).join(" "); }

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef(
  ({ className, sideOffset = 4, showArrow = false, ...props }, ref) => ( 
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        ref={ref}
        sideOffset={sideOffset}
        className={cn(
          "relative z-50 max-w-[280px] rounded-md bg-popover text-popover-foreground px-1.5 py-1 text-xs animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
          className
        )}
        {...props}
      >
        {props.children}
        {showArrow && <TooltipPrimitive.Arrow className="-my-px fill-popover" />}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
);
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

const Dialog = DialogPrimitive.Root;
const DialogPortal = DialogPrimitive.Portal;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogOverlay = React.forwardRef(({ className, ...props }, ref) => ( 
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/60 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className
    )}
    {...props} 
  />
));
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DialogContent = React.forwardRef(
  ({ className, children, ...props }, ref) => ( 
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-[90vw] md:max-w-[800px] translate-x-[-50%] translate-y-[-50%] gap-4 border-none bg-transparent p-0 shadow-none duration-300 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95",
          className
        )}
        {...props}
      >
        <div className="relative bg-card dark:bg-[#303030] rounded-[28px] overflow-hidden shadow-2xl p-1">
          {children}
          <DialogPrimitive.Close className="absolute right-3 top-3 z-10 rounded-full bg-background/50 dark:bg-[#303030] p-1 hover:bg-accent dark:hover:bg-[#515151] transition-all">
            <XIcon className="h-5 w-5 text-muted-foreground dark:text-gray-200 hover:text-foreground dark:hover:text-white" />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        </div>
      </DialogPrimitive.Content>
    </DialogPortal>
  )
);
DialogContent.displayName = DialogPrimitive.Content.displayName;

// SVG Icon Components
const PlusIcon = (props) => ( 
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}> 
    <path d="M12 5V19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> 
    <path d="M5 12H19" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /> 
  </svg> 
);

const SendIcon = (props) => ( 
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}> 
    <path d="M12 5.25L12 18.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> 
    <path d="M18.75 12L12 5.25L5.25 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /> 
  </svg> 
);

const XIcon = (props) => ( 
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}> 
    <line x1="18" y1="6" x2="6" y2="18" /> 
    <line x1="6" y1="6" x2="18" y2="18" /> 
  </svg> 
);

const MicIcon = (props) => ( 
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" {...props}> 
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path> 
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path> 
    <line x1="12" y1="19" x2="12" y2="23"></line> 
  </svg> 
);

// Custom PromptBox Component with LLM Selection
export const CustomPromptInput = React.forwardRef(({ 
  className, 
  value, 
  onChange, 
  onSubmit, 
  placeholder = "Type @ to use MCP tools, or ask me anything...", 
  disabled = false,
  selectedProvider = "openai",
  onProviderChange,
  ...props 
}, ref) => {
  const internalTextareaRef = React.useRef(null);
  const fileInputRef = React.useRef(null);
  const [imagePreview, setImagePreview] = React.useState(null);
  const [isImageDialogOpen, setIsImageDialogOpen] = React.useState(false);
  
  React.useImperativeHandle(ref, () => internalTextareaRef.current, []);
  
  React.useLayoutEffect(() => { 
    const textarea = internalTextareaRef.current; 
    if (textarea) { 
      textarea.style.height = "auto"; 
      const newHeight = Math.min(textarea.scrollHeight, 200); 
      textarea.style.height = `${newHeight}px`; 
    } 
  }, [value]);
  
  const handleInputChange = (e) => { 
    if (onChange) onChange(e); 
  };
  
  const handlePlusClick = () => { 
    fileInputRef.current?.click(); 
  };
  
  const handleFileChange = (event) => { 
    const file = event.target.files?.[0]; 
    if (file && file.type.startsWith("image/")) { 
      const reader = new FileReader(); 
      reader.onloadend = () => { 
        setImagePreview(reader.result); 
      }; 
      reader.readAsDataURL(file); 
    } 
    event.target.value = ""; 
  };
  
  const handleRemoveImage = (e) => { 
    e.stopPropagation(); 
    setImagePreview(null); 
    if(fileInputRef.current) { 
      fileInputRef.current.value = ""; 
    } 
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (onSubmit && (value?.trim() || imagePreview)) {
        onSubmit();
      }
    }
  };
  
  const hasValue = value?.trim().length > 0 || imagePreview;

  return (
    <div className={cn(
      "flex flex-col rounded-[28px] p-2 shadow-sm transition-colors bg-white border dark:bg-[#303030] dark:border-transparent cursor-text",
      className
    )}>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/*" 
      />
      
      {imagePreview && ( 
        <Dialog open={isImageDialogOpen} onOpenChange={setIsImageDialogOpen}> 
          <div className="relative mb-1 w-fit rounded-[1rem] px-1 pt-1"> 
            <button
              type="button"
              className="transition-transform"
              onClick={() => setIsImageDialogOpen(true)}
            > 
              <img
                src={imagePreview}
                alt="Image preview"
                className="h-14.5 w-14.5 rounded-[1rem]" 
              /> 
            </button> 
            <button
              onClick={handleRemoveImage}
              className="absolute right-2 top-2 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-white/50 dark:bg-[#303030] text-black dark:text-white transition-colors hover:bg-accent dark:hover:bg-[#515151]"
              aria-label="Remove image"
            > 
              <XIcon className="h-4 w-4" /> 
            </button> 
          </div> 
          <DialogContent> 
            <img
              src={imagePreview}
              alt="Full size preview"
              className="w-full max-h-[95vh] object-contain rounded-[24px]" 
            /> 
          </DialogContent> 
        </Dialog> 
      )}
      
      <textarea
        ref={internalTextareaRef}
        rows={1}
        value={value}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder}
        disabled={disabled}
        className="custom-scrollbar w-full resize-none border-0 bg-transparent p-3 text-foreground dark:text-white placeholder:text-muted-foreground dark:placeholder:text-gray-300 focus:ring-0 focus-visible:outline-none min-h-12"
        {...props} 
      />
      
      <div className="mt-0.5 p-1 pt-0">
        <TooltipProvider delayDuration={100}>
          <div className="flex items-center gap-2">

            {/* LLM Provider Selection */}
            <div className="flex items-center">
              <select 
                className="text-xs bg-secondary border border-border rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary transition hover:bg-accent text-foreground" 
                value={selectedProvider} 
                onChange={(e) => onProviderChange && onProviderChange(e.target.value)} 
                disabled={disabled}
              >
                <option value="openai">OpenAI</option>
                <option value="gemini">Gemini</option>
                <option value="claude">Claude</option>
                <option value="groq">Groq</option>
              </select>
            </div>

            {/* Right-aligned buttons container */}
            <div className="ml-auto flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="button"
                    className="flex h-8 w-8 items-center justify-center rounded-full text-foreground dark:text-white transition-colors hover:bg-accent dark:hover:bg-[#515151] focus-visible:outline-none"
                  >
                    <MicIcon className="h-5 w-5" />
                    <span className="sr-only">Record voice</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" showArrow={true}>
                  <p>Record voice</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    type="submit"
                    disabled={!hasValue || disabled}
                    onClick={onSubmit}
                    className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none bg-black text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80 disabled:bg-black/40 dark:disabled:bg-[#515151]"
                  >
                    <SendIcon className="h-6 w-6 text-bold" />
                    <span className="sr-only">Send message</span>
                  </button>
                </TooltipTrigger>
                <TooltipContent side="top" showArrow={true}>
                  <p>Send</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </TooltipProvider>
      </div>
    </div>
  );
});

CustomPromptInput.displayName = "CustomPromptInput";
