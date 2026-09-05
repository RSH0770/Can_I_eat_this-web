import type { ReactNode } from 'react';

type PhoneFrameProps = {
    children: ReactNode;
}

export function PhoneFrame({ children }: PhoneFrameProps) {
    return (
        <div className="min-h-dvh w-full sm:flex sm:items-center sm:justify-center bg-neutral-300">
        <div className="flex h-dvh w-full flex-col overflow-hidden sm:h-[844px] sm:w-[390px] sm:shadow-2xl bg-neutral-100">
            {children}
        </div>
    </div>
    )
}