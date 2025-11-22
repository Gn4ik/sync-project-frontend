import './InfoModal.css';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'release' | 'project' | null;
  data: any;
}

const InfoModal = ({ isOpen, onClose, type, data }: InfoModalProps) => {
  if (!isOpen || !type || !data) return null;

  const modalTitles = {
    release: 'Информация о релизе',
    project: 'Информация о проекте'
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content info-modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">{modalTitles[type]}</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className='form-wrapper'>
          <div className="form-section">
            <div className="form-group">
              <label className="form-label form-label-bold">Название:</label>
              <div className="form-input view-only">{data.title}</div>
            </div>

            {type === 'project' && data.parentRelease && (
              <div className="form-group">
                <label className="form-label form-label-bold">Релиз:</label>
                <div className="form-input view-only">{data.parentRelease}</div>
              </div>
            )}

            {type === 'project' && (
              <div className="form-group">
                <label className="form-label form-label-bold">Ссылка:</label>
                <div className="form-input view-only">{data.link || 'Не указана'}</div>
              </div>
            )}

            {type === 'release' && (
              <div className="form-group">
                <label className="form-label form-label-bold">Версия:</label>
                <div className="form-input view-only">{data.version || 'Не указана'}</div>
              </div>
            )}

            <div className="form-group">
              <label className="form-label form-label-bold">Срок:</label>
              <div className="form-input view-only">{data.deadline || 'Не указан'}</div>
            </div>
          </div>

          <div className="form-group-description">
            <label className="form-label form-label-bold description-label">Описание:</label>
            <div className="form-textarea view-only">
              {data.description || 'Описание отсутствует'}
            </div>
          </div>
        </div>

        <div className="modal-actions">
        </div>
      </div>
    </div>
  );
};

export default InfoModal;