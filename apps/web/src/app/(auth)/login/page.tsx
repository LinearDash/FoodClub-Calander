import { Button } from "@foodclub/ui";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface">
      <div className="bg-surface-container-lowest p-8 rounded-xl shadow-lg border-outline-variant max-w-sm w-full">
        <h1 className="font-display text-4xl text-on-surface mb-2 font-bold text-center">Food Club WA</h1>
        <p className="text-on-surface-variant font-body mb-8 text-center">Please login to continue</p>
        
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-semibold uppercase text-on-surface-variant mb-1 font-body">Email</label>
            <input type="email" className="w-full px-4 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container" placeholder="chef@foodclubwa.com.au" />
          </div>
          <div>
            <label className="block text-sm font-semibold uppercase text-on-surface-variant mb-1 font-body">Password</label>
            <input type="password" className="w-full px-4 py-2 rounded-xl bg-surface-container-low border border-outline-variant text-on-surface focus:outline-none focus:ring-2 focus:ring-primary-container" placeholder="••••••••" />
          </div>
          
          <div className="pt-2">
            <Button className="w-full justify-center">Login</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
