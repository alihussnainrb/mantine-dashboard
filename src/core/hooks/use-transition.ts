import { useCallback, useState, useTransition as useReactTransition } from "react";



type TransitionStartFunction = (fn: () => Promise<void> | void) => Promise<void>

export default function useTransition(): [boolean, TransitionStartFunction] {
    const [pending, setPending] = useState(false);
    const [_, transition] = useReactTransition()

    const startTransition = useCallback(async (fn: () => Promise<void> | void) => {
        setPending(true)
        try {
            await fn()
        } catch (error) {
            throw error
        } finally {
            transition(() => setPending(false))
        }
    }, [])

    return [pending, startTransition]
}

