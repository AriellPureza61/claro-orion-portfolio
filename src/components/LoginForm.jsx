export default function LoginForm({ onSubmit }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-8">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm"
      >
        <h1 className="text-center text-2xl font-semibold text-gray-900">
          Entrar
        </h1>

        <div className="space-y-2">
          <label htmlFor="login-email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            id="login-email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="w-full border border-gray-300 bg-white px-3 py-2 text-gray-900"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="login-password" className="block text-sm font-medium text-gray-700">
            Senha
          </label>
          <input
            id="login-password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="w-full border border-gray-300 bg-white px-3 py-2 text-gray-900"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-xl bg-red-700 px-4 py-2 font-semibold text-white hover:bg-red-800 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2"
        >
          Entrar
        </button>
      </form>
    </main>
  );
}
