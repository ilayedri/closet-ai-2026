import React from 'react';
import styles from './Modal.module.css';

export default function Modal({ children, open, onClose }: { children: React.ReactNode; open: boolean; onClose: () => void }) {
  if (!open) return null
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose}>×</button>
        <div className={styles.content}>{children}</div>
      </div>
    </div>
  )
}
