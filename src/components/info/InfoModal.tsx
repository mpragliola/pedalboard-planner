import { Modal } from "../common/Modal";
import "./InfoModal.scss";

interface InfoModalProps {
  open: boolean;
  onClose: () => void;
}

const AUTHOR_EMAIL = "marcopragliola@gmail.com";
const DONATE_URL = "https://www.paypal.com/donate"; // Replace with your preferred donate link

export function InfoModal({ open, onClose }: InfoModalProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="About PedalboardFactory"
      className="info-modal"
      ariaLabel="About PedalboardFactory"
    >
      <p className="info-modal-intro">
        PedalboardFactory helps you plan pedalboard layouts by placing boards and pedals on a canvas. You can
        arrange gear, compare sizes, and export a price-estimate prompt for an LLM.
      </p>

      <h3 className="info-modal-heading">Features</h3>
      <ul className="info-modal-list">
        <li>Add boards and pedals from the catalog (filter by brand, type, size)</li>
        <li>Drag objects to arrange; rotate, send to back, delete</li>
        <li>Undo / redo; zoom and pan; optional grid (mm or inches)</li>
        <li>State is saved automatically in your browser</li>
        <li>
          From the file menu (top right): build a price-estimate prompt for an LLM (optional location and materials)
        </li>
      </ul>

      <h3 className="info-modal-heading">Author</h3>
      <p className="info-modal-author">
        <a href={`mailto:${AUTHOR_EMAIL}`}>Marco Pragliola</a>
        {" · "}
        <a href={DONATE_URL} target="_blank" rel="noopener noreferrer">
          Donate
        </a>
      </p>

      <div className="info-modal-disclaimers">
        <p className="info-modal-disclaimer">
          All brands, models and depictions of any gear shown are property of their respective owners.
        </p>
        <p className="info-modal-disclaimer">
          The database creation process is tedious; we cannot guarantee that the information presented is accurate.
        </p>
      </div>
    </Modal>
  );
}

