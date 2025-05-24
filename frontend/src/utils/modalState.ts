/**
 * Modal State Manager
 * 
 * Simple modal state management
 */

// Create a custom event for modal state changes
const MODAL_CHANGE_EVENT = 'modal-state-change';

// Function to trigger re-renders across components
const triggerModalStateChange = () => {
  const event = new CustomEvent(MODAL_CHANGE_EVENT, {
    detail: { timestamp: Date.now() }
  });
  document.dispatchEvent(event);
};

// Store for the current modal
let currentOpenModal: string | null = null;

const modalState = {
  // Access the currently open modal
  get currentModal(): string | null {
    return currentOpenModal;
  },
  
  // Open a modal, automatically closing any other open modal
  openModal: function(modalId: string): boolean {
    // Close any existing modal first
    if (currentOpenModal) {
      this.closeModal();
    }
    
    // Update state and lock scrolling
    currentOpenModal = modalId;
    document.body.style.overflow = 'hidden'; // Lock scrolling
    console.log(`Modal opened: ${modalId}`);
    
    // Notify listeners
    triggerModalStateChange();
    
    // Return true to indicate success
    return true;
  },
  
  // Close the current modal
  closeModal: function(): boolean {
    // Only do anything if there's a modal open
    if (currentOpenModal) {
      const modalId = currentOpenModal;
      currentOpenModal = null;
      document.body.style.overflow = ''; // Restore scrolling
      console.log(`Modal closed: ${modalId}`);
      
      // Notify listeners
      triggerModalStateChange();
      
      // Return true to indicate a modal was closed
      return true;
    }
    
    // Return false if no modal was open
    return false;
  },
  
  // Check if a specific modal is open
  isModalOpen: function(modalId: string): boolean {
    return currentOpenModal === modalId;
  },
  
  // Subscribe to modal state changes
  subscribe: function(callback: (modalId: string | null) => void): () => void {
    const handler = () => callback(currentOpenModal);
    document.addEventListener(MODAL_CHANGE_EVENT, handler);
    
    // Return unsubscribe function
    return () => {
      document.removeEventListener(MODAL_CHANGE_EVENT, handler);
    };
  }
};

// Set up a listener for page unload to clean up
window.addEventListener('beforeunload', () => {
  document.body.style.overflow = ''; // Ensure scroll is restored
});

export default modalState; 