"use client"

import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
  ToastProgress,
} from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      {toasts.map(function ({ id, title, description, action, duration, ...props }) {
        return (
          <Toast key={id} {...props}>
            <div className="grid gap-1 w-full">
              {props.children || (
                <>
                  {title && <ToastTitle>{title}</ToastTitle>}
                  {description && (
                    <ToastDescription>{description}</ToastDescription>
                  )}
                </>
              )}
            </div>
            {action}
            <ToastClose />
            {duration && <ToastProgress duration={duration} />}
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
