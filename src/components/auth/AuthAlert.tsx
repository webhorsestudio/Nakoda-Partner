interface AuthAlertProps {
  error: string;
  success: string;
}

export default function AuthAlert({ error, success }: AuthAlertProps) {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (success) {
    return (
      <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded relative" role="alert">
        <span className="block sm:inline">{success}</span>
      </div>
    );
  }

  return null;
}
