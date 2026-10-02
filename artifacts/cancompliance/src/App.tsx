import { useEffect, useRef, Component, ReactNode, useState } from "react";
import { Switch, Route, Router as WouterRouter, Redirect, useLocation, Link } from "wouter";
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { ClerkProvider, HandleSSOCallback, TaskChooseOrganization, TaskResetPassword, TaskSetupMFA, useAuth, useClerk, useSession, useSignIn, useSignUp } from "@clerk/react";
import { Eye, EyeOff, Scale, ClipboardCheck, Building2, ArrowRight } from "lucide-react";
import { getDemoRole, setDemoRole } from "@/lib/demoSession";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuditProvider } from "./context/AuditContext";
import AppLayout from "./components/AppLayout";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/Landing";
import Dashboard from "@/pages/Dashboard";
import CaslChecker from "@/pages/CaslChecker";
import PipedaChecker from "@/pages/PipedaChecker";
import Bill96Checker from "@/pages/Bill96Checker";
import AiCopilot from "@/pages/AiCopilot";
import AiCopilotPage from "@/pages/AiCopilotPage";
import Features from "@/pages/Features";
import PricingPage from "@/pages/PricingPage";
import ComplianceScore from "@/pages/ComplianceScore";
import Growth from "@/pages/Growth";
import CCPSA from "@/pages/CCPSA";
import CPLA from "@/pages/CPLA";
import Fintrac from "@/pages/Fintrac";
import ESG from "@/pages/ESG";
import SupplyChain from "@/pages/SupplyChain";
import Payroll from "@/pages/Payroll";
import GstHst from "@/pages/GstHst";
import Employment from "@/pages/Employment";
import Privacy from "@/pages/Privacy";
import Safety from "@/pages/Safety";
import Customs from "@/pages/Customs";
import AiGovernance from "@/pages/AiGovernance";
import EPR from "@/pages/EPR";
import CaslLedger from "@/pages/CaslLedger";
import AuditTrail from "@/pages/AuditTrail";
import Deadlines from "@/pages/Deadlines";
import JurisdictionSetup from "@/pages/JurisdictionSetup";
import ControlMapper from "@/pages/ControlMapper";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Account from "@/pages/Account";
import RedTapeCalculator from "@/pages/RedTapeCalculator";
import LegislationTracker from "@/pages/LegislationTracker";
import DocumentScanner from "@/pages/DocumentScanner";
import Benchmarking from "@/pages/Benchmarking";
import SandboxAdvisor from "@/pages/SandboxAdvisor";
import ComplianceInbox from "@/pages/ComplianceInbox";
import TrustNetwork from "@/pages/TrustNetwork";
import PolicyGenerator from "@/pages/PolicyGenerator";
import FrameworksHub from "@/pages/FrameworksHub";
import ControlLibrary from "@/pages/ControlLibrary";
import SocTwo from "@/pages/SocTwo";
import IsoISMS from "@/pages/IsoISMS";
import Gdpr from "@/pages/Gdpr";
import Hipaa from "@/pages/Hipaa";
import NistAiRmf from "@/pages/NistAiRmf";
import EuAiAct from "@/pages/EuAiAct";
import DeveloperPortal from "@/pages/DeveloperPortal";
import CPPA from "@/pages/CPPA";
import AODA from "@/pages/AODA";
import BeneficialOwnership from "@/pages/BeneficialOwnership";
import DigitalPlatform from "@/pages/DigitalPlatform";
import PayEquity from "@/pages/PayEquity";
import PolicyAttestation from "@/pages/PolicyAttestation";
import FineExposure from "@/pages/FineExposure";
import ScaleAdvisor from "@/pages/ScaleAdvisor";
import GrantFinder from "@/pages/GrantFinder";
import VendorRisk from "@/pages/VendorRisk";
import FindingTracker from "@/pages/FindingTracker";
import EvidencePortal from "@/pages/EvidencePortal";
import IndustryPack from "@/pages/IndustryPack";
import BoardReport from "@/pages/BoardReport";
import AiRemediation from "@/pages/AiRemediation";
import MonitoringCenter from "@/pages/MonitoringCenter";
import IntegrationsHub from "@/pages/IntegrationsHub";
import WorkforceCompliance from "@/pages/WorkforceCompliance";
import DocumentQA from "@/pages/DocumentQA";

// ─── Global Error Boundary ────────────────────────────────────────────────────
interface EBState { hasError: boolean; message: string }
class ErrorBoundary extends Component<{ children: ReactNode; label?: string }, EBState> {
  state: EBState = { hasError: false, message: "" };
  static getDerivedStateFromError(err: Error): EBState {
    return { hasError: true, message: err.message };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-center px-6"
          style={{ background: "#09090a" }}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: "rgba(240,68,56,0.12)", border: "1px solid rgba(240,68,56,0.3)" }}>
            <span className="text-lg">!</span>
          </div>
          <div>
            <p className="font-mono text-xs uppercase tracking-widest mb-1" style={{ color: "#f04438" }}>
              {this.props.label ?? "Page Error"}
            </p>
            <p className="text-sm text-muted-foreground max-w-sm">{this.state.message || "Something went wrong loading this page."}</p>
          </div>
          <button
            onClick={() => { this.setState({ hasError: false, message: "" }); window.location.reload(); }}
            className="px-4 py-2 rounded-lg text-xs font-mono border border-border hover:border-primary/40 transition-colors"
          >
            Reload page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// ─── Auth Loading Spinner ─────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: "#09090a" }}>
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: "#c8f135", borderRightColor: "rgba(200,241,53,0.3)" }} />
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Loading...</p>
      </div>
    </div>
  );
}

const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30000 },
  },
});

function withLayout(Component: React.FC, title: string, subtitle?: string) {
  return function WrappedModule() {
    return (
      <AppLayout title={title} subtitle={subtitle}>
        <Component />
      </AppLayout>
    );
  };
}

const WrappedCCSPA = withLayout(CCPSA, "CCPSA — Product Safety", "Canada Consumer Product Safety Act screening");
const WrappedCPLA = withLayout(CPLA, "CPLA — Packaging & Bilingualism", "Consumer Packaging and Labelling Act · Bill 96");
const WrappedFintrac = withLayout(Fintrac, "FINTRAC — AML / KYC", "PCMLTFA transaction screening · $10K threshold");
const WrappedESG = withLayout(ESG, "ESG — Greenwashing Check", "Competition Act s.74.01 · Bill C-59 anti-greenwashing");
const WrappedSupplyChain = withLayout(SupplyChain, "S-211 — Supply Chain", "Forced labour reporting · CBCA ISC filings");
const WrappedPayroll = withLayout(Payroll, "Payroll — CPP / EI / Tax", "CRA payroll deduction calculator");
const WrappedGstHst = withLayout(GstHst, "GST / HST", "Registration threshold · net tax calculation · filing");
const WrappedEmployment = withLayout(Employment, "Employment Standards", "Minimum wage · overtime · termination notice by province");
const WrappedPrivacy = withLayout(Privacy, "Privacy / PIPEDA", "PIPEDA + Quebec Law 25 privacy compliance");
const WrappedSafety = withLayout(Safety, "Workplace Safety (OHS)", "OHSA · WorkSafeBC · JHSC · WSIB obligations");
const WrappedCustoms = withLayout(Customs, "Customs / CBSA", "CARM · duty rates · CUSMA · retaliatory tariffs");
const WrappedAiGovernance = withLayout(AiGovernance, "AI Governance", "AIDA · Workers IV · Quebec Law 25 s.12.1");
const WrappedEPR = withLayout(EPR, "EPR / Environmental", "Blue Box · ÉEQ · CEPA · battery & electronics stewardship");
const WrappedComplianceScore = withLayout(ComplianceScore, "Live Compliance Score", "Real-time score from all checks this session");
const WrappedCPPA = withLayout(CPPA, "CPPA — Bill C-27 Privacy", "Consumer Privacy Protection Act — replaces PIPEDA · imminent Royal Assent");
const WrappedAODA = withLayout(AODA, "AODA — Accessibility", "Accessibility for Ontarians with Disabilities Act · WCAG 2.0 Level AA");
const WrappedBeneficialOwnership = withLayout(BeneficialOwnership, "Beneficial Ownership Registry", "CBCA s.21.1 · Corporations Canada · mandatory since 2023");
const WrappedDigitalPlatform = withLayout(DigitalPlatform, "Digital Platform Reporting", "CRA DAC-7 · T4A filing · gig economy · marketplace sellers");
const WrappedPayEquity = withLayout(PayEquity, "Pay Equity & Transparency", "Ontario Pay Equity Act · Federal Pay Equity Act 2021 · BC Pay Transparency Act");
const WrappedPolicyAttestation = withLayout(PolicyAttestation, "Policy Attestation Engine", "Track employee policy sign-off · compliance officer tool");
const WrappedFineExposure = withLayout(FineExposure, "Total Fine Exposure Calculator", "Your maximum fine exposure across all Canadian compliance modules");
const WrappedScaleAdvisor = withLayout(ScaleAdvisor, "Ready to Scale? Advisor", "Compliance obligations triggered at each business milestone");
const WrappedGrantFinder = withLayout(GrantFinder, "Government Grant Finder", "Canadian federal & provincial grants for compliance investments");
const WrappedVendorRisk = withLayout(VendorRisk, "Vendor Risk Scorecard", "Third-party vendor compliance assessment · OSFI B-10 · PIPEDA");
const WrappedFindingTracker = withLayout(FindingTracker, "Finding Tracker", "Audit findings through full remediation lifecycle");
const WrappedEvidencePortal = withLayout(EvidencePortal, "Evidence Collection Portal", "Upload and track audit evidence tied to compliance controls");
const WrappedIndustryPack = withLayout(IndustryPack, "Industry Compliance Pack", "Pre-configured compliance modules by industry type");
const WrappedBoardReport = withLayout(BoardReport, "Board Reporting Pack", "Executive compliance status report for board of directors");
const WrappedAiRemediation = withLayout(AiRemediation, "AI Remediation Engine", "AI-generated code fixes and policy templates for compliance violations");
const WrappedMonitoringCenter = withLayout(MonitoringCenter, "Monitoring Center", "Continuous automated compliance checks · live status · alerts");
const WrappedIntegrationsHub = withLayout(IntegrationsHub, "Integrations Hub", "Connect cloud & HR tools for automated evidence collection");
const WrappedWorkforceCompliance = withLayout(WorkforceCompliance, "Workforce Compliance", "Security training · onboarding · offboarding — Canadian statutory obligations");
const WrappedDocumentQA = withLayout(DocumentQA, "Document Library & RAG", "Upload documents · ask questions · RAG retrieval from compliance knowledge base");

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isSignedIn, isLoaded } = useAuth();
  // Allow demo sessions to bypass Clerk auth
  if (getDemoRole()) {
    return (
      <ErrorBoundary label="Module Error">
        <Component />
      </ErrorBoundary>
    );
  }
  if (!isLoaded) return <PageLoader />;
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  return (
    <ErrorBoundary label="Module Error">
      <Component />
    </ErrorBoundary>
  );
}

function HomeRoute() {
  const { isSignedIn, isLoaded } = useAuth();
  // Render landing immediately — redirect fires only once auth is confirmed
  if (isLoaded && isSignedIn) return <Redirect to="/dashboard" />;
  return <Landing />;
}

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left branding panel */}
      <div className="hidden sm:flex flex-col justify-between w-[320px] flex-shrink-0 border-r border-border px-8 py-10"
        style={{ background: "linear-gradient(160deg, rgba(200,241,53,0.04) 0%, transparent 60%)" }}>
        <div>
          <a href={basePath || "/"} className="font-serif italic text-xl text-foreground hover:opacity-80 transition-opacity">
            CanCompliance
          </a>
          <div className="mt-16">
            <div className="font-mono text-[10px] text-primary uppercase tracking-widest mb-4">Canada Compliance Engine</div>
            <h2 className="font-serif italic text-3xl text-foreground leading-snug mb-6">
              Stay <span style={{ color: "#c8f135" }}>compliant.</span><br />
              Avoid the fines.
            </h2>
            <p className="text-[13px] text-muted-foreground leading-relaxed mb-10">
              16 compliance modules, one platform. CASL, PIPEDA, Bill 96, FINTRAC, Employment Standards, and more — checked in seconds.
            </p>
            <div className="space-y-3">
              {[
                "Real-time statute citations",
                "AI Copilot powered by Claude & GPT",
                "Live compliance score",
                "PIPEDA-compliant data handling",
              ].map((f) => (
                <div key={f} className="flex items-center gap-2.5">
                  <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: "#c8f135" }} />
                  <span className="text-[13px] text-muted-foreground">{f}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="font-mono text-[11px] text-muted-foreground">
          Not legal advice · Built for Canadian SMBs
        </div>
      </div>

      {/* Right form panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        {children}
      </div>
    </div>
  );
}

// PublicRoute: if already signed in, skip auth pages and go straight to dashboard
// While Clerk is loading we render children immediately so there's no blank flash
function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();
  if (isLoaded && isSignedIn) return <Redirect to="/dashboard" />;
  return <>{children}</>;
}

const DEMO_PERSONAS = [
  {
    role: "Compliance Officer",
    short: "Full platform",
    desc: "All 14 modules, AI Copilot, score engine, policy generator",
    Icon: Scale,
    color: "#c8f135",
    bg: "rgba(200,241,53,0.08)",
    border: "rgba(200,241,53,0.2)",
  },
  {
    role: "Auditor",
    short: "Deep audit",
    desc: "Audit trail, control mapper, document scanner, remediation planner",
    Icon: ClipboardCheck,
    color: "#12b76a",
    bg: "rgba(18,183,106,0.08)",
    border: "rgba(18,183,106,0.2)",
  },
  {
    role: "Business Owner",
    short: "Quick scan",
    desc: "Compliance scan, jurisdiction setup, CASL ledger, deadlines",
    Icon: Building2,
    color: "#f5a623",
    bg: "rgba(245,166,35,0.08)",
    border: "rgba(245,166,35,0.2)",
  },
];

// ─── Shared input style ───────────────────────────────────────────────────────
const inputCls = "w-full px-3 py-2.5 rounded-xl border border-border bg-muted/30 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/60 focus:ring-1 focus:ring-primary/20 transition-colors";
const btnPrimary = { background: "#c8f135", color: "#09090a" };

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
      <path d="M43.6 20.5h-1.6V20H24v8h11.3C33.6 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.3 29.3 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.2-.1-2.3-.4-3.5z" fill="#FFC107"/>
      <path d="M6.3 14.7l6.6 4.8C14.5 16 19 12 24 12c3 0 5.8 1.1 7.9 3l5.7-5.7C34 6.3 29.3 4 24 4c-7.7 0-14.4 4.4-17.7 10.7z" fill="#FF3D00"/>
      <path d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.6-3.3-11.3-8H6.3C9.6 38.1 16.3 44 24 44z" fill="#4CAF50"/>
      <path d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.2 5.2C37 38.8 44 34 44 24c0-1.2-.1-2.3-.4-3.5z" fill="#1976D2"/>
    </svg>
  );
}

function AuthFieldset({ label, type = "text", value, onChange, placeholder, children }: {
  label: string; type?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; children?: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  const isPassword = type === "password";
  return (
    <div>
      <label className="block text-[13px] font-medium text-foreground mb-1.5">{label}</label>
      <div className="relative">
        <input
          type={isPassword && show ? "text" : type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          required
          autoComplete={isPassword ? "current-password" : type === "email" ? "email" : "off"}
          className={inputCls + (isPassword ? " pr-10" : "")}
        />
        {isPassword && (
          <button type="button" tabIndex={-1}
            onClick={() => setShow(s => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
            {show ? <EyeOff size={15} /> : <Eye size={15} />}
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function AuthError({ msg }: { msg: string }) {
  if (!msg) return null;
  return (
    <div className="px-3 py-2.5 rounded-xl text-[12px] text-red-300 border border-red-500/20 bg-red-500/8">
      {msg}
    </div>
  );
}

function clerkErrorText(error: { longMessage?: string; message?: string } | null | undefined, fallback: string) {
  return error?.longMessage || error?.message || fallback;
}

const oauthRedirectCallbackUrl = `${basePath}/sso-callback`;
const oauthRedirectUrl = `${basePath}/session-tasks`;

function navigateAfterAuth(
  setLocation: (path: string) => void,
  { session, decorateUrl }: { session: { currentTask?: unknown }; decorateUrl: (url: string) => string },
) {
  const path = session.currentTask ? "/session-tasks" : "/dashboard";
  const destination = decorateUrl(`${basePath}${path}`);
  if (destination.startsWith("http")) {
    window.location.href = destination;
    return;
  }
  setLocation(stripBase(destination));
}

function SignInPage() {
  const { isLoaded } = useAuth();
  const { signIn, fetchStatus } = useSignIn();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"form" | "verify">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const ready = isLoaded && fetchStatus !== "fetching" && !loading;

  const finishSignIn = async () => {
    const { error: finalizeError } = await signIn.finalize({
      navigate: (params) => navigateAfterAuth(setLocation, params),
    });
    if (finalizeError) {
      setError(clerkErrorText(finalizeError, "Sign in could not be completed."));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    setLoading(true); setError("");
    try {
      const { error: passwordError } = await signIn.password({ emailAddress: email, password });
      if (passwordError) {
        setError(clerkErrorText(passwordError, "Sign in failed. Check your credentials."));
        return;
      }

      if (signIn.status === "complete") {
        await finishSignIn();
        return;
      }

      if (signIn.status === "needs_client_trust" || signIn.status === "needs_second_factor") {
        const emailFactor = signIn.supportedSecondFactors.find((factor) => factor.strategy === "email_code");
        if (!emailFactor) {
          setError("This account needs another verification step that this page cannot complete. Try Google sign-in.");
          return;
        }
        const { error: sendError } = await signIn.mfa.sendEmailCode();
        if (sendError) {
          setError(clerkErrorText(sendError, "Could not send a verification code."));
          return;
        }
        setStep("verify");
        return;
      }

      if (signIn.status === "needs_new_password") {
        setError("Your password must be reset before you can sign in.");
        return;
      }

      setError("Sign in could not be completed. Try again.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      setError(message || "Sign in failed. Check your credentials.");
    } finally { setLoading(false); }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    setLoading(true); setError("");
    try {
      const { error: verifyError } = await signIn.mfa.verifyEmailCode({ code });
      if (verifyError) {
        setError(clerkErrorText(verifyError, "Invalid code. Please check your email and try again."));
        return;
      }
      if (signIn.status === "complete") {
        await finishSignIn();
        return;
      }
      setError("Verification did not finish sign-in. Try again.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      setError(message || "Invalid code. Please check your email and try again.");
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    if (!isLoaded || fetchStatus === "fetching") return;
    setError("");
    try {
      const { error: ssoError } = await signIn.sso({
        strategy: "oauth_google",
        redirectCallbackUrl: oauthRedirectCallbackUrl,
        redirectUrl: oauthRedirectUrl,
      });
      if (ssoError) setError(clerkErrorText(ssoError, "Google sign-in unavailable. Use email below."));
    } catch {
      setError("Google sign-in unavailable. Use email below.");
    }
  };

  if (step === "verify") {
    return (
      <PublicRoute>
        <AuthLayout>
          <div className="w-full max-w-sm">
            <div className="mb-7">
              <h1 className="font-serif italic text-2xl text-foreground mb-1">Verify it's you</h1>
              <p className="text-[13px] text-muted-foreground">
                We sent a 6-digit code to <span className="text-foreground font-medium">{email}</span>. Enter it to finish signing in.
              </p>
            </div>
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1.5">Verification code</label>
                <input type="text" inputMode="numeric" maxLength={6}
                  value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456" required autoFocus
                  className={inputCls + " text-center text-lg tracking-[0.3em] font-mono"}
                  data-testid="sign-in-verify-code"
                />
              </div>
              <AuthError msg={error} />
              <button type="submit" disabled={!ready || code.length < 6}
                className="w-full py-2.5 rounded-xl text-[13px] font-semibold transition-opacity disabled:opacity-60"
                style={btnPrimary} data-testid="sign-in-verify-submit">
                {loading ? "Verifying…" : "Verify"}
              </button>
            </form>
            <button onClick={() => { setStep("form"); setError(""); setCode(""); }}
              className="w-full text-center text-[12px] text-muted-foreground hover:text-foreground mt-4 transition-colors">
              ← Back to sign in
            </button>
          </div>
        </AuthLayout>
      </PublicRoute>
    );
  }

  return (
    <PublicRoute>
      <AuthLayout>
        <div className="w-full max-w-sm">
          <div className="mb-7">
            <h1 className="font-serif italic text-2xl text-foreground mb-1">Sign in to CanCompliance</h1>
            <p className="text-[13px] text-muted-foreground">Welcome back! Please sign in to continue.</p>
          </div>

          <button onClick={handleGoogle} type="button"
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors mb-4 text-[13px] font-medium text-foreground">
            <GoogleIcon /> Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AuthFieldset label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@company.com" />
            <AuthFieldset label="Password" type="password" value={password} onChange={setPassword} placeholder="Your password" />
            <AuthError msg={error} />
            <button type="submit" disabled={!ready}
              className="w-full py-2.5 rounded-xl text-[13px] font-semibold transition-opacity disabled:opacity-60"
              style={btnPrimary} data-testid="sign-in-submit">
              {loading ? "Signing in…" : "Continue"}
            </button>
          </form>

          <p className="text-center text-[12px] text-muted-foreground mt-4">
            Don't have an account?{" "}
            <Link href="/sign-up" className="text-foreground hover:underline font-medium">Sign up</Link>
          </p>

          <div className="mt-6 pt-5 border-t border-border">
            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-px bg-border" />
              <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">Try a demo role</span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {DEMO_PERSONAS.map((p) => (
                <button
                  key={p.role}
                  type="button"
                  data-testid={`demo-${p.role.toLowerCase().replace(/\s+/g, "-")}`}
                  onClick={() => { setDemoRole(p.role); setLocation("/dashboard"); }}
                  className="group flex flex-col items-start gap-2.5 p-3 rounded-xl border transition-all duration-200 cursor-pointer h-full w-full text-left"
                  style={{
                    borderColor: "rgba(255,255,255,0.07)",
                    background: "rgba(255,255,255,0.02)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = p.border;
                    (e.currentTarget as HTMLButtonElement).style.background = p.bg;
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.07)";
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.02)";
                  }}
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: p.bg, border: `1px solid ${p.border}` }}>
                    <p.Icon size={14} style={{ color: p.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-semibold text-foreground leading-tight mb-0.5">{p.role}</div>
                    <div className="font-mono text-[9px] uppercase tracking-wide" style={{ color: p.color }}>{p.short}</div>
                  </div>
                  <ArrowRight size={11} className="text-muted-foreground group-hover:translate-x-0.5 transition-transform self-end" />
                </button>
              ))}
            </div>
            <p className="text-center text-[10px] text-muted-foreground mt-3">No sign-up needed · demo resets on tab close</p>
          </div>
        </div>
      </AuthLayout>
    </PublicRoute>
  );
}

function SignUpPage() {
  const { isLoaded } = useAuth();
  const { signUp, fetchStatus } = useSignUp();
  const [, setLocation] = useLocation();
  const [step, setStep] = useState<"form" | "verify">("form");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const ready = isLoaded && fetchStatus !== "fetching" && !loading;

  // Read ?role= from URL
  const urlRole = new URLSearchParams(window.location.search).get("role") ?? "";
  const persona = DEMO_PERSONAS.find(p => p.role === urlRole);
  const roleMetadata = urlRole ? { unsafeMetadata: { role: urlRole } } : {};

  const finishSignUp = async () => {
    const { error: finalizeError } = await signUp.finalize({
      navigate: (params) => navigateAfterAuth(setLocation, params),
    });
    if (finalizeError) {
      setError(clerkErrorText(finalizeError, "Sign up could not be completed."));
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    setLoading(true); setError("");
    try {
      // Persist the demo role into Clerk unsafeMetadata from day 1
      const { error: passwordError } = await signUp.password({
        emailAddress: email,
        password,
        ...roleMetadata,
      });
      if (passwordError) {
        setError(clerkErrorText(passwordError, "Sign up failed. Try a different email or stronger password."));
        return;
      }

      if (signUp.status === "complete") {
        await finishSignUp();
        return;
      }

      if (signUp.unverifiedFields.includes("email_address")) {
        const { error: sendError } = await signUp.verifications.sendEmailCode();
        if (sendError) {
          setError(clerkErrorText(sendError, "Could not send a verification code."));
          return;
        }
        setStep("verify");
        return;
      }

      if (signUp.missingFields.length > 0) {
        setError("Additional account details are required before this sign-up can finish.");
        return;
      }

      setError("Sign up could not be completed. Try again.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      setError(message || "Sign up failed. Try a different email or stronger password.");
    } finally { setLoading(false); }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ready) return;
    setLoading(true); setError("");
    try {
      const { error: verifyError } = await signUp.verifications.verifyEmailCode({ code });
      if (verifyError) {
        setError(clerkErrorText(verifyError, "Invalid code. Please check your email and try again."));
        return;
      }
      if (signUp.status === "complete") {
        await finishSignUp();
        return;
      }
      setError("Verification did not finish sign-up. Try again.");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "";
      setError(message || "Invalid code. Please check your email and try again.");
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    if (!isLoaded || fetchStatus === "fetching") return;
    setError("");
    try {
      const { error: ssoError } = await signUp.sso({
        strategy: "oauth_google",
        redirectCallbackUrl: oauthRedirectCallbackUrl,
        redirectUrl: oauthRedirectUrl,
        ...roleMetadata,
      });
      if (ssoError) setError(clerkErrorText(ssoError, "Google sign-up unavailable. Use email below."));
    } catch {
      setError("Google sign-up unavailable. Use email below.");
    }
  };

  if (step === "verify") {
    return (
      <PublicRoute>
        <AuthLayout>
          <div className="w-full max-w-sm">
            <div className="mb-7">
              <div className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
                style={{ background: "rgba(200,241,53,0.12)", border: "1px solid rgba(200,241,53,0.3)" }}>
                <span style={{ color: "#c8f135", fontSize: 18 }}>✉</span>
              </div>
              <h1 className="font-serif italic text-2xl text-foreground mb-1">Check your email</h1>
              <p className="text-[13px] text-muted-foreground">
                We sent a 6-digit code to <span className="text-foreground font-medium">{email}</span>. Enter it below to verify your account.
              </p>
            </div>
            <form onSubmit={handleVerify} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-foreground mb-1.5">Verification code</label>
                <input type="text" inputMode="numeric" maxLength={6}
                  value={code} onChange={e => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="123456" required autoFocus
                  className={inputCls + " text-center text-lg tracking-[0.3em] font-mono"}
                  data-testid="verify-code-input"
                />
              </div>
              <AuthError msg={error} />
              <div id="clerk-captcha" />
              <button type="submit" disabled={!ready || code.length < 6}
                className="w-full py-2.5 rounded-xl text-[13px] font-semibold transition-opacity disabled:opacity-60"
                style={btnPrimary} data-testid="verify-submit">
                {loading ? "Verifying…" : "Verify Email"}
              </button>
            </form>
            <button onClick={() => { setStep("form"); setError(""); setCode(""); }}
              className="w-full text-center text-[12px] text-muted-foreground hover:text-foreground mt-4 transition-colors">
              ← Back to sign up
            </button>
          </div>
        </AuthLayout>
      </PublicRoute>
    );
  }

  return (
    <PublicRoute>
      <AuthLayout>
        <div className="w-full max-w-sm">
          <div className="mb-7">
            {persona && (
              <div className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border mb-5"
                style={{ borderColor: persona.border, background: persona.bg }}>
                <div className="w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0"
                  style={{ background: persona.bg, border: `1px solid ${persona.border}` }}>
                  <persona.Icon size={13} style={{ color: persona.color }} />
                </div>
                <div>
                  <div className="text-[11px] font-semibold" style={{ color: persona.color }}>{persona.role}</div>
                  <div className="text-[10px] text-muted-foreground">{persona.short} access · {persona.desc.split(",")[0]}</div>
                </div>
              </div>
            )}
            <h1 className="font-serif italic text-2xl text-foreground mb-1">
              {persona ? `Create your ${persona.role} account` : "Create your account"}
            </h1>
            <p className="text-[13px] text-muted-foreground">Welcome! Please fill in the details to get started.</p>
          </div>

          <button onClick={handleGoogle} type="button"
            className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 rounded-xl border border-border bg-card hover:bg-muted/40 transition-colors mb-4 text-[13px] font-medium text-foreground">
            <GoogleIcon /> Continue with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-border" />
            <span className="text-[11px] text-muted-foreground">or</span>
            <div className="flex-1 h-px bg-border" />
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            <AuthFieldset label="Email address" type="email" value={email} onChange={setEmail} placeholder="you@company.com" />
            <AuthFieldset label="Password" type="password" value={password} onChange={setPassword} placeholder="Create a password (min 8 chars)" />
            <AuthError msg={error} />
            <div id="clerk-captcha" />
            <button type="submit" disabled={!ready}
              className="w-full py-2.5 rounded-xl text-[13px] font-semibold transition-opacity disabled:opacity-60"
              style={btnPrimary} data-testid="sign-up-submit">
              {loading ? "Creating account…" : "Continue"}
            </button>
          </form>

          <p className="text-center text-[12px] text-muted-foreground mt-4">
            Already have an account?{" "}
            <Link href="/sign-in" className="text-foreground hover:underline font-medium">Sign in</Link>
          </p>

          <p className="text-center text-[10px] text-muted-foreground mt-4 leading-relaxed">
            By continuing, you agree to our{" "}
            <Link href="/privacy-policy" className="underline hover:text-foreground transition-colors">Privacy Policy</Link>.
            Not legal advice.
          </p>
        </div>
      </AuthLayout>
    </PublicRoute>
  );
}

function ClerkQueryCacheInvalidator() {
  const { addListener } = useClerk();
  const qc = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);

  useEffect(() => {
    const unsub = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) {
        qc.clear();
      }
      prevUserIdRef.current = userId;
    });
    return unsub;
  }, [addListener, qc]);

  return null;
}

function AppBody() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <Switch>
      <Route path="/" component={HomeRoute} />
      <Route path="/sign-in/*?" component={SignInPage} />
      <Route path="/sign-up/*?" component={SignUpPage} />
      <Route path="/sso-callback" component={SsoCallbackPage} />
      <Route path="/session-tasks" component={SessionTasksPage} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/features" component={Features} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/ai-copilot" component={AiCopilotPage} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/casl" component={() => <ProtectedRoute component={CaslChecker} />} />
      <Route path="/pipeda" component={() => <ProtectedRoute component={PipedaChecker} />} />
      <Route path="/bill96" component={() => <ProtectedRoute component={Bill96Checker} />} />
      <Route path="/copilot" component={() => <ProtectedRoute component={AiCopilot} />} />
      <Route path="/compliance-score" component={() => <ProtectedRoute component={WrappedComplianceScore} />} />
      <Route path="/growth" component={() => <ProtectedRoute component={Growth} />} />
      <Route path="/ccpsa" component={() => <ProtectedRoute component={WrappedCCSPA} />} />
      <Route path="/cpla" component={() => <ProtectedRoute component={WrappedCPLA} />} />
      <Route path="/fintrac" component={() => <ProtectedRoute component={WrappedFintrac} />} />
      <Route path="/esg" component={() => <ProtectedRoute component={WrappedESG} />} />
      <Route path="/supply-chain" component={() => <ProtectedRoute component={WrappedSupplyChain} />} />
      <Route path="/payroll" component={() => <ProtectedRoute component={WrappedPayroll} />} />
      <Route path="/gst-hst" component={() => <ProtectedRoute component={WrappedGstHst} />} />
      <Route path="/employment" component={() => <ProtectedRoute component={WrappedEmployment} />} />
      <Route path="/privacy" component={() => <ProtectedRoute component={WrappedPrivacy} />} />
      <Route path="/safety" component={() => <ProtectedRoute component={WrappedSafety} />} />
      <Route path="/customs" component={() => <ProtectedRoute component={WrappedCustoms} />} />
      <Route path="/ai-governance" component={() => <ProtectedRoute component={WrappedAiGovernance} />} />
      <Route path="/epr" component={() => <ProtectedRoute component={WrappedEPR} />} />
      <Route path="/casl-ledger" component={() => <ProtectedRoute component={CaslLedger} />} />
      <Route path="/audit-trail" component={() => <ProtectedRoute component={AuditTrail} />} />
      <Route path="/deadlines" component={() => <ProtectedRoute component={Deadlines} />} />
      <Route path="/jurisdiction" component={() => <ProtectedRoute component={JurisdictionSetup} />} />
      <Route path="/control-mapper" component={() => <ProtectedRoute component={ControlMapper} />} />
      <Route path="/account" component={() => <ProtectedRoute component={Account} />} />
      <Route path="/red-tape-calculator" component={() => <ProtectedRoute component={RedTapeCalculator} />} />
      <Route path="/legislation-tracker" component={() => <ProtectedRoute component={LegislationTracker} />} />
      <Route path="/document-scanner" component={() => <ProtectedRoute component={DocumentScanner} />} />
      <Route path="/benchmarking" component={() => <ProtectedRoute component={Benchmarking} />} />
      <Route path="/sandbox-advisor" component={() => <ProtectedRoute component={SandboxAdvisor} />} />
      <Route path="/compliance-inbox" component={() => <ProtectedRoute component={ComplianceInbox} />} />
      <Route path="/trust-network" component={() => <ProtectedRoute component={TrustNetwork} />} />
      <Route path="/policy-generator" component={() => <ProtectedRoute component={PolicyGenerator} />} />
      <Route path="/frameworks" component={() => <ProtectedRoute component={FrameworksHub} />} />
      <Route path="/control-library" component={() => <ProtectedRoute component={ControlLibrary} />} />
      <Route path="/soc2" component={() => <ProtectedRoute component={SocTwo} />} />
      <Route path="/iso27001" component={() => <ProtectedRoute component={IsoISMS} />} />
      <Route path="/gdpr" component={() => <ProtectedRoute component={Gdpr} />} />
      <Route path="/hipaa" component={() => <ProtectedRoute component={Hipaa} />} />
      <Route path="/nist-ai-rmf" component={() => <ProtectedRoute component={NistAiRmf} />} />
      <Route path="/eu-ai-act" component={() => <ProtectedRoute component={EuAiAct} />} />
      <Route path="/developer" component={() => <ProtectedRoute component={DeveloperPortal} />} />
      <Route path="/cppa" component={() => <ProtectedRoute component={WrappedCPPA} />} />
      <Route path="/aoda" component={() => <ProtectedRoute component={WrappedAODA} />} />
      <Route path="/beneficial-ownership" component={() => <ProtectedRoute component={WrappedBeneficialOwnership} />} />
      <Route path="/digital-platform" component={() => <ProtectedRoute component={WrappedDigitalPlatform} />} />
      <Route path="/pay-equity" component={() => <ProtectedRoute component={WrappedPayEquity} />} />
      <Route path="/policy-attestation" component={() => <ProtectedRoute component={WrappedPolicyAttestation} />} />
      <Route path="/fine-exposure" component={() => <ProtectedRoute component={WrappedFineExposure} />} />
      <Route path="/scale-advisor" component={() => <ProtectedRoute component={WrappedScaleAdvisor} />} />
      <Route path="/grant-finder" component={() => <ProtectedRoute component={WrappedGrantFinder} />} />
      <Route path="/vendor-risk" component={() => <ProtectedRoute component={WrappedVendorRisk} />} />
      <Route path="/finding-tracker" component={() => <ProtectedRoute component={WrappedFindingTracker} />} />
      <Route path="/evidence-portal" component={() => <ProtectedRoute component={WrappedEvidencePortal} />} />
      <Route path="/industry-pack" component={() => <ProtectedRoute component={WrappedIndustryPack} />} />
      <Route path="/board-report" component={() => <ProtectedRoute component={WrappedBoardReport} />} />
      <Route path="/ai-remediation" component={() => <ProtectedRoute component={WrappedAiRemediation} />} />
      <Route path="/monitoring" component={() => <ProtectedRoute component={WrappedMonitoringCenter} />} />
      <Route path="/integrations" component={() => <ProtectedRoute component={WrappedIntegrationsHub} />} />
      <Route path="/workforce" component={() => <ProtectedRoute component={WrappedWorkforceCompliance} />} />
      <Route path="/document-qa" component={() => <ProtectedRoute component={WrappedDocumentQA} />} />
      <Route component={NotFound} />
    </Switch>
  );
}

function SsoCallbackPage() {
  const [, setLocation] = useLocation();

  return (
    <AuthLayout>
      <div className="w-full max-w-sm flex flex-col items-center gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-transparent animate-spin"
          style={{ borderTopColor: "#c8f135", borderRightColor: "rgba(200,241,53,0.3)" }} />
        <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Completing sign-in…</p>
        <HandleSSOCallback
          navigateToApp={(params) => navigateAfterAuth(setLocation, params)}
          navigateToSignIn={() => setLocation("/sign-in")}
          navigateToSignUp={() => setLocation("/sign-up")}
        />
      </div>
    </AuthLayout>
  );
}

function SessionTasksPage() {
  const { isLoaded, session } = useSession();
  if (!isLoaded) return <PageLoader />;
  const task = session?.currentTask;
  const redirectUrlComplete = `${basePath}/dashboard`;
  if (!session || !task) return <Redirect to="/dashboard" />;

  return (
    <AuthLayout>
      <div className="w-full max-w-md">
        {task.key === "choose-organization" && <TaskChooseOrganization redirectUrlComplete={redirectUrlComplete} />}
        {task.key === "reset-password" && <TaskResetPassword redirectUrlComplete={redirectUrlComplete} />}
        {task.key === "setup-mfa" && <TaskSetupMFA redirectUrlComplete={redirectUrlComplete} />}
      </div>
    </AuthLayout>
  );
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();

  return (
    <ClerkProvider
      publishableKey={clerkPubKey!}
      proxyUrl={clerkProxyUrl}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryCacheInvalidator />
        <TooltipProvider>
          <AuditProvider>
            <ErrorBoundary label="Application Error">
              <AppBody />
            </ErrorBoundary>
          </AuditProvider>
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

function App() {
  return (
    <WouterRouter base={basePath}>
      <ClerkProviderWithRoutes />
    </WouterRouter>
  );
}

export default App;
