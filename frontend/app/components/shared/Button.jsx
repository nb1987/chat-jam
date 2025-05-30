import SpinnerMini from "./SpinnerMini";

export default function Button({
  type,
  isProcessing,
  text,
  onClick,
  children,
  buttonStyle,
}) {
  return (
    <>
      {isProcessing ? (
        <button
          type={type || "button"}
          className={buttonStyle + " opacity-50"}
          disabled
        >
          <SpinnerMini text={text} />
        </button>
      ) : (
        <button
          type={type || "button"}
          className={buttonStyle}
          onClick={onClick ? onClick : () => {}}
        >
          {children}
        </button>
      )}
    </>
  );
}
