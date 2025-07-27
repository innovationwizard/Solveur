import ChatInterface from '@/components/ChatInterface'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">
          Solveur
        </h1>
        <p className="text-center text-gray-600 mb-8">
          AI-Powered Business Problem Solver
        </p>
        <ChatInterface />
      </div>
    </main>
  )
}