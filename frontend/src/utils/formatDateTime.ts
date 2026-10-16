// Formats a timestamp in Finnish, e.g. "ke 21.10. klo 12.00"
export function formatDateTime(value: string): string {
    return new Date(value).toLocaleString("fi-FI", {
        weekday: "short",
        day: "numeric",
        month: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

// Converts a timestamp to a local "YYYY-MM-DDTHH:mm" string
export function toDateTimeLocalValue(value: string): string {
    const date = new Date(value)
    const pad = (n: number) => n.toString().padStart(2, "0")
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
