import InstallPWA from '../components/InstallPWA';

export default function Home() {
  return (
    <div className="min-h-screen p-6">
      <main className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-6">
          Bienvenido a Refuel Pickup
        </h1>

        <p className="text-xl text-center text-gray-600 mb-8">
          Tu servicio de recarga de combustible
        </p>
        
        <InstallPWA />
      </main>
    </div>
  );
} 