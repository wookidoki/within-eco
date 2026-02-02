import { Overlay, ModalContainer } from './Modal.styles'

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null

  return (
    <Overlay onClick={onClose}>
      <ModalContainer onClick={(e) => e.stopPropagation()}>
        {children}
      </ModalContainer>
    </Overlay>
  )
}

export default Modal
