import React from 'react'
import styles from './Button.module.css'

type Props = {
  children: React.ReactNode
  variant?: 'primary' | 'ghost'
  onClick?: () => void
}

export default function Button({ children, variant = 'primary', onClick }: Props) {
  return (
    <button className={`${styles.button} ${styles[variant]}`} onClick={onClick}>
      {children}
    </button>
  )
}
