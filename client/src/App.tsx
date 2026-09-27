import { useEffect, useState, type ReactNode } from 'react';
import {
  Routes,
  Route,
  Navigate,
  NavLink,
  useNavigate,
} from 'react-router-dom';
import axios from 'axios';
import {
  LayoutDashboard,
  BriefcaseBusiness,
  Users,
  GitBranch,
  LogOut,
  Plus,
  Search,
  Trash2,
  Edit3,
  Menu,
  X,
} from 'lucide-react';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

type Job = {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  description: string;
  status: string;
  createdAt: string;
};

type Candidate = {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  experience: string;
  stage: string;
  jobId: string;
  createdAt: string;
};

const stages = [
  'Applied',
  'Screening',
  'Interview',
  'Offered',
  'Hired',
  'Rejected',
];

/* =========================
   AUTH
========================= */

function Auth({ register = false }: { register?: boolean }) {
  const nav = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setErr('');

    try {
      const { data } = await api.post(
        register ? '/auth/register' : '/auth/login',
        {
          name,
          email,
          password,
        }
      );

      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));

      nav('/dashboard');
    } catch (error: any) {
      setErr(error.response?.data?.message || 'Something went wrong');
    }
  }

  return (
    <div className="auth">
      <div className="auth-card">
        <div className="brand big">
          H<span>F</span>
        </div>

        <h1>{register ? 'Create your account' : 'Welcome back'}</h1>

        <p>
          {register
            ? 'Start managing your hiring pipeline.'
            : 'Sign in to your HireFlow workspace.'}
        </p>

        <form onSubmit={submit}>
          {register && (
            <label>
              Full name
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                minLength={2}
              />
            </label>
          )}

          <label>
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </label>

          <label>
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </label>

          {err && <div className="error">{err}</div>}

          <button className="primary full" type="submit">
            {register ? 'Create account' : 'Sign in'}
          </button>
        </form>

        <p className="switch">
          {register
            ? 'Already have an account? '
            : 'New to HireFlow? '}

          <NavLink to={register ? '/login' : '/register'}>
            {register ? 'Sign in' : 'Create account'}
          </NavLink>
        </p>
      </div>
    </div>
  );
}

/* =========================
   PROTECTED ROUTE
========================= */

function Protected({ children }: { children: ReactNode }) {
  return localStorage.getItem('token') ? (
    <>{children}</>
  ) : (
    <Navigate to="/login" replace />
  );
}

/* =========================
   MAIN SHELL
========================= */

function Shell({ children }: { children: ReactNode }) {
  const nav = useNavigate();

  const [open, setOpen] = useState(false);

  const user = JSON.parse(
    localStorage.getItem('user') || '{}'
  );

  function logout() {
    localStorage.clear();
    nav('/login');
  }

  return (
    <div className="app">
      <aside className={open ? 'open' : ''}>
        <div className="side-head">
          <div className="brand">
            Hire<span>Flow</span>
          </div>

          <button
            type="button"
            className="icon mobile"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>

        <nav>
          <NavLink to="/dashboard">
            <LayoutDashboard />
            Dashboard
          </NavLink>

          <NavLink to="/jobs">
            <BriefcaseBusiness />
            Jobs
          </NavLink>

          <NavLink to="/candidates">
            <Users />
            Candidates
          </NavLink>

          <NavLink to="/pipeline">
            <GitBranch />
            Pipeline
          </NavLink>
        </nav>

        <div className="profile">
          <div className="avatar">
            {(user.name || 'U')[0]}
          </div>

          <div>
            <b>{user.name || 'Recruiter'}</b>
            <small>{user.email}</small>
          </div>

          <button
            type="button"
            className="icon"
            onClick={logout}
          >
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      <main>
        <header>
          <button
            type="button"
            className="icon mobile"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </button>

          <div>
            <b>HireFlow Workspace</b>
            <small>Recruitment Management</small>
          </div>
        </header>

        <section className="content">
          {children}
        </section>
      </main>
    </div>
  );
}

/* =========================
   DASHBOARD
========================= */

function Dashboard() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    api.get('/dashboard').then((response) => {
      setData(response.data);
    });
  }, []);

  if (!data) {
    return <Loading />;
  }

  return (
    <>
      <PageHead
        title="Dashboard"
        sub="Your recruitment performance at a glance."
      />

      <div className="stats">
        {[
          ['Open Jobs', data.openJobs],
          ['Total Candidates', data.totalCandidates],
          ['Interviews', data.interviews],
          ['Hired', data.hired],
        ].map(([label, value]) => (
          <div className="stat" key={label}>
            <small>{label}</small>
            <strong>{value}</strong>
          </div>
        ))}
      </div>

      <div className="panel">
        <h2>Recent candidates</h2>

        {data.recent.map((candidate: Candidate) => (
          <div className="row" key={candidate.id}>
            <div className="avatar">
              {candidate.name[0]}
            </div>

            <div className="grow">
              <b>{candidate.name}</b>
              <small>{candidate.role}</small>
            </div>

            <Badge text={candidate.stage} />
          </div>
        ))}

        {!data.recent.length && (
          <Empty text="No candidates yet. Add your first candidate." />
        )}
      </div>
    </>
  );
}

/* =========================
   JOBS
========================= */

function Jobs() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [show, setShow] = useState(false);
  const [edit, setEdit] = useState<Job | null>(null);

  const load = () => {
    api.get('/jobs').then((response) => {
      setJobs(response.data);
    });
  };

  useEffect(() => {
    load();
  }, []);

  async function removeJob(id: string) {
    if (confirm('Delete this job?')) {
      await api.delete(`/jobs/${id}`);
      load();
    }
  }

  return (
    <>
      <PageHead
        title="Jobs"
        sub="Create and manage open positions."
        action={
          <button
            type="button"
            className="primary"
            onClick={() => {
              setEdit(null);
              setShow(true);
            }}
          >
            <Plus />
            New Job
          </button>
        }
      />

      <div className="grid">
        {jobs.map((job) => (
          <div className="card" key={job.id}>
            <div className="cardtop">
              <Badge text={job.status} />

              <div>
                <button
                  type="button"
                  className="icon"
                  onClick={() => {
                    setEdit(job);
                    setShow(true);
                  }}
                >
                  <Edit3 />
                </button>

                <button
                  type="button"
                  className="icon danger"
                  onClick={() => removeJob(job.id)}
                >
                  <Trash2 />
                </button>
              </div>
            </div>

            <h3>{job.title}</h3>

            <p>
              {job.department} · {job.location}
            </p>

            <small>{job.type}</small>
          </div>
        ))}
      </div>

      {!jobs.length && (
        <Empty text="No jobs yet. Create your first opening." />
      )}

      {show && (
        <JobModal
          job={edit}
          close={() => setShow(false)}
          done={() => {
            setShow(false);
            load();
          }}
        />
      )}
    </>
  );
}

/* =========================
   JOB MODAL
========================= */

function JobModal({
  job,
  close,
  done,
}: {
  job: Job | null;
  close: () => void;
  done: () => void;
}) {
  const [form, setForm] = useState<any>(
    job || {
      title: '',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      description: '',
      status: 'Open',
    }
  );

  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (job) {
      await api.put(`/jobs/${job.id}`, form);
    } else {
      await api.post('/jobs', form);
    }

    done();
  }

  return (
    <Modal close={close}>
      <h2>{job ? 'Edit job' : 'Create a new job'}</h2>

      <form onSubmit={save} className="form">
        <label>
          Job title
          <input
            required
            value={form.title}
            onChange={(e) =>
              setForm({
                ...form,
                title: e.target.value,
              })
            }
          />
        </label>

        <label>
          Department
          <input
            required
            value={form.department}
            onChange={(e) =>
              setForm({
                ...form,
                department: e.target.value,
              })
            }
          />
        </label>

        <div className="two">
          <label>
            Location
            <input
              required
              value={form.location}
              onChange={(e) =>
                setForm({
                  ...form,
                  location: e.target.value,
                })
              }
            />
          </label>

          <label>
            Type
            <select
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value,
                })
              }
            >
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
          </label>
        </div>

        <label>
          Description
          <textarea
            value={form.description}
            onChange={(e) =>
              setForm({
                ...form,
                description: e.target.value,
              })
            }
          />
        </label>

        <button className="primary" type="submit">
          {job ? 'Save changes' : 'Create job'}
        </button>
      </form>
    </Modal>
  );
}

/* =========================
   CANDIDATES
========================= */

function Candidates() {
  const [candidates, setCandidates] =
    useState<Candidate[]>([]);

  const [jobs, setJobs] = useState<Job[]>([]);
  const [query, setQuery] = useState('');
  const [show, setShow] = useState(false);

  const [edit, setEdit] =
    useState<Candidate | null>(null);

  const load = () => {
    api.get('/candidates').then((response) => {
      setCandidates(response.data);
    });
  };

  useEffect(() => {
    load();

    api.get('/jobs').then((response) => {
      setJobs(response.data);
    });
  }, []);

  async function removeCandidate(id: string) {
    if (confirm('Delete this candidate?')) {
      await api.delete(`/candidates/${id}`);
      load();
    }
  }

  const list = candidates.filter((candidate) =>
    (
      candidate.name +
      candidate.email +
      candidate.role
    )
      .toLowerCase()
      .includes(query.toLowerCase())
  );

  return (
    <>
      <PageHead
        title="Candidates"
        sub="Manage applicants across all roles."
        action={
          <button
            type="button"
            className="primary"
            onClick={() => {
              setEdit(null);
              setShow(true);
            }}
          >
            <Plus />
            Add Candidate
          </button>
        }
      />

      <div className="search">
        <Search />

        <input
          placeholder="Search candidates..."
          value={query}
          onChange={(e) =>
            setQuery(e.target.value)
          }
        />
      </div>

      <div className="table">
        <div className="tr th">
          <span>Candidate</span>
          <span>Role</span>
          <span>Experience</span>
          <span>Stage</span>
          <span>Actions</span>
        </div>

        {list.map((candidate) => (
          <div className="tr" key={candidate.id}>
            <span>
              <b>{candidate.name}</b>
              <small>{candidate.email}</small>
            </span>

            <span>{candidate.role}</span>

            <span>
              {candidate.experience || '—'}
            </span>

            <span>
              <select
                className="stage"
                value={candidate.stage}
                onChange={async (e) => {
                  await api.patch(
                    `/candidates/${candidate.id}/stage`,
                    {
                      stage: e.target.value,
                    }
                  );

                  load();
                }}
              >
                {stages.map((stage) => (
                  <option key={stage}>
                    {stage}
                  </option>
                ))}
              </select>
            </span>

            <span>
              <button
                type="button"
                className="icon"
                onClick={() => {
                  setEdit(candidate);
                  setShow(true);
                }}
              >
                <Edit3 />
              </button>

              <button
                type="button"
                className="icon danger"
                onClick={() =>
                  removeCandidate(candidate.id)
                }
              >
                <Trash2 />
              </button>
            </span>
          </div>
        ))}
      </div>

      {!list.length && (
        <Empty text="No candidates found." />
      )}

      {show && (
        <CandidateModal
          candidate={edit}
          jobs={jobs}
          close={() => setShow(false)}
          done={() => {
            setShow(false);
            load();
          }}
        />
      )}
    </>
  );
}

/* =========================
   CANDIDATE MODAL
========================= */

function CandidateModal({
  candidate,
  jobs,
  close,
  done,
}: {
  candidate: Candidate | null;
  jobs: Job[];
  close: () => void;
  done: () => void;
}) {
  const [form, setForm] = useState<any>(
    candidate || {
      name: '',
      email: '',
      phone: '',
      role: '',
      experience: '',
      stage: 'Applied',
      jobId: jobs[0]?.id || '',
    }
  );

  async function save(
    e: React.FormEvent<HTMLFormElement>
  ) {
    e.preventDefault();

    if (candidate) {
      await api.put(
        `/candidates/${candidate.id}`,
        form
      );
    } else {
      await api.post('/candidates', form);
    }

    done();
  }

  return (
    <Modal close={close}>
      <h2>
        {candidate
          ? 'Edit candidate'
          : 'Add candidate'}
      </h2>

      <form onSubmit={save} className="form">
        <div className="two">
          <label>
            Name
            <input
              required
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
            />
          </label>

          <label>
            Email
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
            />
          </label>
        </div>

        <div className="two">
          <label>
            Phone
            <input
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value,
                })
              }
            />
          </label>

          <label>
            Experience
            <input
              placeholder="e.g. 4 years"
              value={form.experience}
              onChange={(e) =>
                setForm({
                  ...form,
                  experience: e.target.value,
                })
              }
            />
          </label>
        </div>

        <label>
          Role
          <input
            required
            value={form.role}
            onChange={(e) =>
              setForm({
                ...form,
                role: e.target.value,
              })
            }
          />
        </label>

        <div className="two">
          <label>
            Stage
            <select
              value={form.stage}
              onChange={(e) =>
                setForm({
                  ...form,
                  stage: e.target.value,
                })
              }
            >
              {stages.map((stage) => (
                <option key={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </label>

          <label>
            Job
            <select
              value={form.jobId}
              onChange={(e) =>
                setForm({
                  ...form,
                  jobId: e.target.value,
                })
              }
            >
              <option value="">
                Unassigned
              </option>

              {jobs.map((job) => (
                <option
                  key={job.id}
                  value={job.id}
                >
                  {job.title}
                </option>
              ))}
            </select>
          </label>
        </div>

        <button
          className="primary"
          type="submit"
        >
          {candidate
            ? 'Save changes'
            : 'Add candidate'}
        </button>
      </form>
    </Modal>
  );
}

/* =========================
   PIPELINE
========================= */

function Pipeline() {
  const [candidates, setCandidates] =
    useState<Candidate[]>([]);

  const load = () => {
    api.get('/candidates').then((response) => {
      setCandidates(response.data);
    });
  };

  useEffect(() => {
    load();
  }, []);

  async function move(
    candidate: Candidate,
    direction: number
  ) {
    const currentIndex = stages.indexOf(
      candidate.stage
    );

    const nextIndex = Math.max(
      0,
      Math.min(
        stages.length - 1,
        currentIndex + direction
      )
    );

    await api.patch(
      `/candidates/${candidate.id}/stage`,
      {
        stage: stages[nextIndex],
      }
    );

    load();
  }

  return (
    <>
      <PageHead
        title="Hiring Pipeline"
        sub="Move applicants through each recruitment stage."
      />

      <div className="pipeline">
        {stages.map((stage) => (
          <div className="column" key={stage}>
            <div className="colhead">
              <b>{stage}</b>

              <span>
                {
                  candidates.filter(
                    (candidate) =>
                      candidate.stage === stage
                  ).length
                }
              </span>
            </div>

            {candidates
              .filter(
                (candidate) =>
                  candidate.stage === stage
              )
              .map((candidate) => (
                <div
                  className="candidate"
                  key={candidate.id}
                >
                  <b>{candidate.name}</b>
                  <small>{candidate.role}</small>

                  <div className="moves">
                    <button
                      type="button"
                      disabled={
                        stage === 'Applied'
                      }
                      onClick={() =>
                        move(candidate, -1)
                      }
                    >
                      ←
                    </button>

                    <button
                      type="button"
                      disabled={
                        stage === 'Rejected'
                      }
                      onClick={() =>
                        move(candidate, 1)
                      }
                    >
                      →
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ))}
      </div>
    </>
  );
}

/* =========================
   MODAL
========================= */

type ModalProps = {
  children: ReactNode;
  close: () => void;
};

function Modal({
  children,
  close,
}: ModalProps) {
  return (
    <div
      className="overlay"
      onMouseDown={close}
    >
      <div
        className="modal"
        onMouseDown={(e) =>
          e.stopPropagation()
        }
      >
        <button
          type="button"
          className="close"
          onClick={close}
        >
          ×
        </button>

        {children}
      </div>
    </div>
  );
}

/* =========================
   SHARED COMPONENTS
========================= */

function PageHead({
  title,
  sub,
  action,
}: {
  title: string;
  sub: string;
  action?: ReactNode;
}) {
  return (
    <div className="pagehead">
      <div>
        <h1>{title}</h1>
        <p>{sub}</p>
      </div>

      {action}
    </div>
  );
}

function Badge({ text }: { text: string }) {
  return (
    <span
      className={
        'badge ' + text.toLowerCase()
      }
    >
      {text}
    </span>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div className="empty">
      {text}
    </div>
  );
}

function Loading() {
  return (
    <div className="empty">
      Loading…
    </div>
  );
}

/* =========================
   APP ROUTES
========================= */

export default function App() {
  const protectedRoutes = [
    {
      path: '/dashboard',
      element: <Dashboard />,
    },
    {
      path: '/jobs',
      element: <Jobs />,
    },
    {
      path: '/candidates',
      element: <Candidates />,
    },
    {
      path: '/pipeline',
      element: <Pipeline />,
    },
  ];

  return (
    <Routes>
      <Route
        path="/login"
        element={<Auth />}
      />

      <Route
        path="/register"
        element={<Auth register />}
      />

      {protectedRoutes.map(
        ({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={
              <Protected>
                <Shell>
                  {element}
                </Shell>
              </Protected>
            }
          />
        )
      )}

      <Route
        path="*"
        element={
          <Navigate
            to={
              localStorage.getItem('token')
                ? '/dashboard'
                : '/login'
            }
            replace
          />
        }
      />
    </Routes>
  );
}