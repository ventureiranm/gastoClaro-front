// Confirma que una acción salió bien y la anuncia a los lectores de pantalla. Puede recibir el
// foco (tabIndex -1) para que se anuncie aunque haya aparecido de golpe.
export default function SuccessMessage({ ref, message }) {
  if (!message) return null;

  return (
    <div ref={ref} className="success-message" role="status" tabIndex={-1}>
      <p>{message}</p>
    </div>
  );
}
