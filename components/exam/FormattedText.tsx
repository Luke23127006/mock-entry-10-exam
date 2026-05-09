import * as React from 'react'

interface FormattedTextProps {
  text?: string
  className?: string
}

export function FormattedText({ text, className }: FormattedTextProps) {
  if (!text) return null

  // Khai báo Regex bằng new RegExp dưới dạng String để tránh bị lỗi khi Next.js Minify code trên Production
  const regexPattern = "((?<!_)__(?!_)(?:(?!__).)+?(?<!_)__(?!_))"
  const regex = new RegExp(regexPattern, "g")
  
  const parts = text.split(regex)

  return (
    <span className={className}>
      {parts.map((part, index) => {
        // Kiểm tra an toàn trước khi gọi startsWith/endsWith
        if (part && part.startsWith('__') && part.endsWith('__')) {
          const content = part.slice(2, -2)
          return (
            <span key={index} className="underline decoration-2 underline-offset-4 font-bold text-primary/90">
              {content}
            </span>
          )
        }
        return <React.Fragment key={index}>{part}</React.Fragment>
      })}
    </span>
  )
}