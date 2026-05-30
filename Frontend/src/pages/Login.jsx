import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/axios'
import useAuthStore from '../store/useAuthStore'

export default function Login() {
    const navigate = useNavigate()
    const { setAuth } = useAuthStore()

    const [form, setForm] = useState({ email: '', password: '' })
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const { data } = await api.post('/auth/login', form)
            setAuth(data.user, data.token)
            navigate('/dashboard')
        } catch (err) {
            setError(err.response?.data?.error || 'Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 w-full max-w-md">

                <h1 className="text-2xl font-semibold text-gray-900 mb-1">Welcome back</h1>
                <p className="text-gray-500 text-sm mb-6">Sign in to your account</p>

                {error && (
                    <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="you@example.com"
                            required
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200
                         text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                    </div>

                    <div>
                        <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                            className="w-full px-4 py-2.5 rounded-lg border border-gray-200
                         text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm
                       font-medium hover:bg-gray-700 transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>
                </form>

                <p className="text-sm text-gray-500 text-center mt-6">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-gray-900 font-medium hover:underline">
                        Sign up
                    </Link>
                </p>

            </div>
        </div>
    )
}