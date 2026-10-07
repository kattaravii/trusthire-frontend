import { useState } from 'react'

function JobForm() {
  const [form, setForm] = useState({
    title: '',
    location: '',
    salary: '',
    type: 'Full-time',
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <section className="card">
      <div className="card-header">
        <h3>Post a New Job</h3>
      </div>

      <form className="form-grid" onSubmit={handleSubmit}>
        <label>
          Job title
          <input name="title" value={form.title} onChange={handleChange} placeholder="Senior Product Designer" />
        </label>
        <label>
          Location
          <input name="location" value={form.location} onChange={handleChange} placeholder="Remote / London" />
        </label>
        <label>
          Salary
          <input name="salary" value={form.salary} onChange={handleChange} placeholder="$120k" />
        </label>
        <label>
          Type
          <select name="type" value={form.type} onChange={handleChange}>
            <option>Full-time</option>
            <option>Contract</option>
            <option>Part-time</option>
          </select>
        </label>

        <button type="submit" className="primary-btn">
          Publish Job
        </button>
      </form>

      {submitted ? <p className="success-text">Your job post is ready for review.</p> : null}
    </section>
  )
}

export default JobForm
