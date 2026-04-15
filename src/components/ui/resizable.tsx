'use client';

import * as React from 'react';
import * as ResizablePrimitive from 'react-resizable-panels';

import { cn } from '@/lib/utils';

const ResizablePanelGroup = function ResizablePanelGroup({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <ResizablePrimitive.Group
      className={cn(
        'flex h-full w-full data-[panel-group-direction=vertical]:flex-col',
        className
      )}
      {...props}
    />
  );
};

const ResizablePanel = function ResizablePanel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <ResizablePrimitive.Panel
      className={cn('h-full w-full', className)}
      {...props}
    />
  );
};

const ResizableHandle = function ResizableHandle({
  className,
  withHandle,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { withHandle?: boolean }) {
  return (
    <ResizablePrimitive.Separator
      className={cn(
        'relative flex w-px items-center justify-center bg-border after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2 after:bg-border focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 [&[data-orientation=vertical]]:h-px [&[data-orientation=vertical]]:w-full [&[data-orientation=vertical]]:after:left-0 [&[data-orientation=vertical]]:after:h-1 [&[data-orientation=vertical]]:after:w-full [&[data-orientation=vertical]]:after:-translate-y-1/2 [&[data-orientation=vertical]]:after:translate-x-0',
        withHandle && 'after:bg-primary/50 after:ring-1 after:ring-primary',
        className
      )}
      {...props}
    />
  );
};

export { ResizableHandle, ResizablePanel, ResizablePanelGroup };
