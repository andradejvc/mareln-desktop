export default function GoogleButton() {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-mare-laranja bg-mare-creme px-4 py-2.5 text-sm font-medium text-gray-800 transition hover:bg-mare-laranja/10"
    >
      <i className="fi-brands-google text-lg" />
      Continuar com o Google
    </button>
  );
}