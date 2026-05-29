import React, { useState } from "react";
import { User, Lock, Shield, Newspaper, Sparkles, Key, ArrowRight, Sun, Moon, Mail, CheckCircle, ArrowLeft } from "lucide-react";

interface LoginScreenProps {
  onLoginSuccess: (role: "admin" | "reader", name?: string, isRegistered?: boolean) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}

export default function LoginScreen({ onLoginSuccess, isDarkMode, onToggleTheme }: LoginScreenProps) {
  const [activeTab, setActiveTab] = useState<"admin" | "reader">("admin");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // New Reader / Subscriber States
  const [readerStep, setReaderStep] = useState<"sign_in" | "register" | "guest" | "forgot_password">("sign_in");
  const [readerEmail, setReaderEmail] = useState("");
  const [readerPassword, setReaderPassword] = useState("");
  const [readerRegisterName, setReaderRegisterName] = useState("");
  const [readerRegisterEmail, setReaderRegisterEmail] = useState("");
  const [readerRegisterPassword, setReaderRegisterPassword] = useState("");
  const [receiveNotifications, setReceiveNotifications] = useState(true);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoverySuccessMessage, setRecoverySuccessMessage] = useState("");

  // Helper load/get reader users list from localStorage
  const getRegisteredUsers = (): any[] => {
    const data = localStorage.getItem("news_hub_registered_users");
    if (!data) {
      // Pre-seed a default account for quick testing
      const defaults = [
        { name: "João Silva", email: "leitor@newshub.com", password: "leitor", receiveNotifications: true }
      ];
      localStorage.setItem("news_hub_registered_users", JSON.stringify(defaults));
      return defaults;
    }
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  };

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setRecoverySuccessMessage("");

    if (!username.trim() || !password.trim()) {
      setError("Por favor, preencha todos os campos do Administrador.");
      return;
    }

    // Demo credentials check: admin / admin
    if (username.toLowerCase().trim() === "admin" && password === "admin") {
      onLoginSuccess("admin", "Administrador");
    } else {
      setError("Usuário ou senha incorretos! Tente usuário 'admin' e senha 'admin'.");
    }
  };

  // Submit Handler: Registered Reader Login
  const handleReaderLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setRecoverySuccessMessage("");

    const emailVal = readerEmail.trim().toLowerCase();
    const passwordVal = readerPassword;

    if (!emailVal || !passwordVal) {
      setError("Por favor, preencha o e-mail e a senha.");
      return;
    }

    const registeredUsers = getRegisteredUsers();
    const user = registeredUsers.find(u => u.email === emailVal);

    if (!user) {
      setError("Esta conta não foi encontrada. Crie um novo cadastro!");
      return;
    }

    if (user.password !== passwordVal) {
      setError("Senha incorreta cadastrada para este e-mail.");
      return;
    }

    onLoginSuccess("reader", user.name, true);
  };

  // Submit Handler: New Reader Registration with unique Username Generator Suffix
  const handleReaderRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setRecoverySuccessMessage("");

    const nameVal = readerRegisterName.trim();
    const emailVal = readerRegisterEmail.trim().toLowerCase();
    const passwordVal = readerRegisterPassword.trim();

    if (!nameVal || !emailVal || !passwordVal) {
      setError("Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    if (!emailVal.includes("@") || !emailVal.includes(".")) {
      setError("Insira um e-mail válido para receber avisos.");
      return;
    }

    if (passwordVal.length < 4) {
      setError("A senha deve conter pelo menos 4 caracteres.");
      return;
    }

    const registeredUsers = getRegisteredUsers();

    // Verify if email is already taken
    if (registeredUsers.some(u => u.email === emailVal)) {
      setError("Este e-mail de login já está em uso por outro usuário.");
      return;
    }

    // Generate Unique Name if repeated
    let finalizedUniqueName = nameVal;
    const lowerName = nameVal.toLowerCase().trim();
    const isRepeated = registeredUsers.some(u => u.name.toLowerCase().trim() === lowerName);

    if (isRepeated) {
      let suffix = 1;
      while (true) {
        const suffixStr = `#${suffix.toString().padStart(2, "0")}`;
        const tentativeName = `${nameVal}${suffixStr}`;
        if (!registeredUsers.some(u => u.name.toLowerCase().trim() === tentativeName.toLowerCase().trim())) {
          finalizedUniqueName = tentativeName;
          break;
        }
        suffix++;
      }
    }

    // Save into list
    const newUser = {
      name: finalizedUniqueName,
      email: emailVal,
      password: passwordVal,
      receiveNotifications: receiveNotifications
    };

    const updatedList = [...registeredUsers, newUser];
    localStorage.setItem("news_hub_registered_users", JSON.stringify(updatedList));

    // Instant Login
    onLoginSuccess("reader", finalizedUniqueName, true);
  };

  // Submit Handler: Request Forgotten Password (Simulated)
  const handleReaderRecovery = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setRecoverySuccessMessage("");

    const emailVal = recoveryEmail.trim().toLowerCase();
    if (!emailVal) {
      setError("Por favor, digite seu e-mail cadastrado.");
      return;
    }

    const registeredUsers = getRegisteredUsers();
    const user = registeredUsers.find(u => u.email === emailVal);

    if (!user) {
      setError("Nenhum usuário cadastrado com este e-mail.");
      return;
    }

    setRecoverySuccessMessage(
      `Sucesso! Solicitação enviada. Um link de redefinição de credenciais de acesso foi simulado para "${emailVal}". Para fins de teste de protótipo, sua senha atual é: "${user.password}".`
    );
  };

  // Pre-fill helper credentials
  const prefillAdminCredentials = () => {
    setUsername("admin");
    setPassword("admin");
    setError("");
  };

  const prefillReaderCredentials = () => {
    setReaderEmail("leitor@newshub.com");
    setReaderPassword("leitor");
    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4 transition-colors duration-200">
      
      {/* Absolute Top Right Theme Customizer */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        <button
          onClick={onToggleTheme}
          className="p-2.5 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 shadow-xs cursor-pointer transition-colors"
          title="Alternar Tema Escuro"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4 text-indigo-500" />}
        </button>
      </div>

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-2xl overflow-hidden min-h-[500px]">
        
        {/* Left Side: Brand Splash & Features */}
        <div className="md:col-span-5 bg-gradient-to-br from-blue-700 via-indigo-700 to-indigo-900 p-8 text-white flex flex-col justify-between">
          <div className="space-y-6">
            <div className="flex items-center gap-2.5">
              <div className="h-10 w-10 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 shadow-xs">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-extrabold text-lg tracking-tight font-display">
                  NewsHub
                </h1>
                <p className="text-[10px] text-indigo-200 uppercase tracking-widest font-mono">
                  SISTEMA EDITORIAL INTEGRADO
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-6">
              <h2 className="text-2xl font-bold font-display tracking-tight leading-snug">
                Gerencie, crie e leia notícias com o poder da IA.
              </h2>
              <p className="text-xs text-indigo-100/90 leading-relaxed font-sans">
                Uma central de publicação multiuso avançada, com suporte a escrita inteligente assistida por inteligência artificial, páginas institucionais estáticas e pré-visualizador de leitura de ponta.
              </p>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 space-y-3.5 mt-8 md:mt-0">
            <div className="flex items-start gap-2.5 text-xs text-indigo-100">
              <Shield className="w-4 h-4 text-indigo-300 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block text-white">Painel Administrativo</span>
                Edição em Markdown completo, tags, criação de páginas e auxílio heurístico.
              </div>
            </div>
            
            <div className="flex items-start gap-2.5 text-xs text-indigo-100">
              <Newspaper className="w-4 h-4 text-indigo-300 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold block text-white">Portal do Leitor</span>
                Navegação responsiva, leitura limpa das notícias e páginas institucionais.
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Tabbed Login Form */}
        <div className="md:col-span-7 p-8 flex flex-col justify-center bg-white dark:bg-slate-900">
          
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white font-display tracking-tight">
              Seja bem-vindo de volta!
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Escolha seu perfil de acesso para inicializar a sessão.
            </p>
          </div>

          {/* Profile Choice Tabs */}
          <div className="grid grid-cols-2 gap-2 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl mb-6 border border-slate-200/50 dark:border-slate-800/40">
            <button
              type="button"
              onClick={() => {
                setActiveTab("admin");
                setError("");
              }}
              className={`py-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all ${
                activeTab === "admin"
                  ? "bg-white text-blue-600 dark:bg-slate-800 dark:text-blue-400 shadow-sm"
                  : "text-slate-650 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <Shield className="w-3.5 h-3.5" />
              Administrador
            </button>
            <button
              type="button"
              onClick={() => {
                setActiveTab("reader");
                setError("");
              }}
              className={`py-2.5 text-xs font-bold rounded-lg flex items-center justify-center gap-2 cursor-pointer transition-all ${
                activeTab === "reader"
                  ? "bg-white text-blue-600 dark:bg-slate-800 dark:text-blue-400 shadow-sm"
                  : "text-slate-655 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Leitor / Visitante
            </button>
          </div>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-550/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex gap-2">
              <span className="font-bold">Aviso:</span>
              <span>{error}</span>
            </div>
          )}

          {activeTab === "admin" ? (
            /* Admin Form content */
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1.5 uppercase tracking-wider">
                  Usuário do Admin
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Ex: admin"
                    className="pl-9 pr-4 py-2 w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-blue-500 focus:bg-white focus:outline-hidden dark:focus:bg-slate-900 dark:text-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider">
                    Senha Administrativa
                  </label>
                  <button
                    type="button"
                    onClick={prefillAdminCredentials}
                    className="text-[10px] text-indigo-600 dark:text-indigo-400 font-bold hover:underline flex items-center gap-1"
                  >
                    <Key className="w-3 h-3" /> Preenchimento Automático
                  </button>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ex: admin"
                    className="pl-9 pr-4 py-2 w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-blue-500 focus:bg-white focus:outline-hidden dark:focus:bg-slate-900 dark:text-white transition-colors"
                  />
                </div>
              </div>

              <div className="text-[10px] bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 p-2.5 rounded-lg border border-slate-150 dark:border-slate-800/80 leading-relaxed">
                <span className="font-semibold text-slate-700 dark:text-slate-300">Dica de Desenvolvimento:</span> As credenciais padrão do console administrativo são: usuário <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded text-blue-600 dark:text-blue-400 font-bold font-mono">admin</code> e senha <code className="bg-slate-200 dark:bg-slate-800 px-1 rounded text-blue-600 dark:text-blue-400 font-bold font-mono">admin</code>.
              </div>

              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-blue-500/10 cursor-pointer overflow-hidden group select-none transition-all active:scale-98"
              >
                Entrar no Painel Administrativo
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </button>
            </form>
          ) : (
            /* Tabbed Reader Form & Multi-option Account System */
            <div className="space-y-4">
              
              {/* Main Subsections Tabs: Sign In / Sign Up / Anonymous */}
              <div className="grid grid-cols-3 gap-1.5 bg-slate-100 dark:bg-slate-950 p-1 rounded-xl border border-slate-200/50 dark:border-slate-800/40">
                <button
                  type="button"
                  onClick={() => {
                    setReaderStep("sign_in");
                    setError("");
                    setRecoverySuccessMessage("");
                  }}
                  className={`py-2 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all ${
                    readerStep === "sign_in" || readerStep === "forgot_password"
                      ? "bg-white text-indigo-700 dark:bg-slate-800 dark:text-indigo-400 shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-205"
                  }`}
                >
                  Entrar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReaderStep("register");
                    setError("");
                    setRecoverySuccessMessage("");
                  }}
                  className={`py-2 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all ${
                    readerStep === "register"
                      ? "bg-white text-indigo-700 dark:bg-slate-800 dark:text-indigo-400 shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-205"
                  }`}
                >
                  Criar Conta
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReaderStep("guest");
                    setError("");
                    setRecoverySuccessMessage("");
                  }}
                  className={`py-2 text-[10px] font-bold rounded-lg flex items-center justify-center gap-1 cursor-pointer transition-all ${
                    readerStep === "guest"
                      ? "bg-white text-indigo-700 dark:bg-slate-800 dark:text-indigo-400 shadow-sm"
                      : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-205"
                  }`}
                >
                  Sem Cadastro
                </button>
              </div>

              {recoverySuccessMessage && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-medium rounded-xl leading-relaxed">
                  {recoverySuccessMessage}
                </div>
              )}

              {/* ROUTE 1: READER SIGN IN */}
              {readerStep === "sign_in" && (
                <form onSubmit={handleReaderLogin} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1.5 uppercase tracking-wider">
                      Seu E-mail Cadastrado
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={readerEmail}
                        onChange={(e) => setReaderEmail(e.target.value)}
                        placeholder="Ex: joao@newshub.com"
                        className="pl-9 pr-4 py-2 w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:focus:bg-slate-900 dark:text-white transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 uppercase tracking-wider">
                        Sua Senha
                      </label>
                      <button
                        type="button"
                        onClick={prefillReaderCredentials}
                        className="text-[10px] text-indigo-650 dark:text-indigo-400 font-bold hover:underline flex items-center gap-0.5"
                      >
                        <Key className="w-3 h-3" /> Usar Conta Padrão
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={readerPassword}
                        onChange={(e) => setReaderPassword(e.target.value)}
                        placeholder="Insira sua senha de leitor"
                        className="pl-9 pr-4 py-2 w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:focus:bg-slate-900 dark:text-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <button
                      type="button"
                      onClick={() => setReaderStep("forgot_password")}
                      className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 font-medium hover:underline cursor-pointer"
                    >
                      Esqueceu sua senha? Solicitar recuperação
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-indigo-500/10 cursor-pointer overflow-hidden group transition-all active:scale-98"
                  >
                    Entrar e Ler Notícias
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </form>
              )}

              {/* ROUTE 2: READER SIGN UP / REGISTER */}
              {readerStep === "register" && (
                <form onSubmit={handleReaderRegister} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1.5 uppercase tracking-wider flex justify-between items-center">
                      <span>Nome Completo / Apelido <strong className="text-rose-500 font-black">*</strong></span>
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        required
                        value={readerRegisterName}
                        onChange={(e) => setReaderRegisterName(e.target.value)}
                        placeholder="Ex: João Silva ou joaosilva"
                        className="pl-9 pr-4 py-2 w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:focus:bg-slate-900 dark:text-white transition-colors"
                      />
                    </div>
                    <p className="text-[9px] text-slate-400 mt-1 pl-1 dark:text-slate-500">
                      🔒 Se o nome já existir, adicionaremos um ID único (ex: #01) para protegê-lo de fraude.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1.5 uppercase tracking-wider">
                      Seu E-mail <strong className="text-rose-500 font-black">*</strong>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={readerRegisterEmail}
                        onChange={(e) => setReaderRegisterEmail(e.target.value)}
                        placeholder="Ex: seu-email@exemplo.com"
                        className="pl-9 pr-4 py-2 w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:focus:bg-slate-900 dark:text-white transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1.5 uppercase tracking-wider">
                      Crie uma Senha <strong className="text-rose-500 font-black">*</strong>
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="password"
                        required
                        value={readerRegisterPassword}
                        onChange={(e) => setReaderRegisterPassword(e.target.value)}
                        placeholder="Mínimo de 4 caracteres"
                        className="pl-9 pr-4 py-2 w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:focus:bg-slate-900 dark:text-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex items-start gap-2 pt-1">
                    <input
                      id="opt-notifications"
                      type="checkbox"
                      checked={receiveNotifications}
                      onChange={(e) => setReceiveNotifications(e.target.checked)}
                      className="mt-0.5 rounded border-slate-300 dark:border-slate-800 text-indigo-650 focus:ring-indigo-500"
                    />
                    <label htmlFor="opt-notifications" className="text-[11px] text-slate-600 dark:text-slate-350 leading-tight cursor-pointer select-none">
                      Quero receber e-mail automático instantâneo de notificação sempre que uma nova notícia ou artigo de destaque for lançado no NewsHub! 📬
                    </label>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-indigo-650 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-indigo-500/10 cursor-pointer overflow-hidden group transition-all active:scale-98"
                  >
                    Registrar Conta e Acessar
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </form>
              )}

              {/* ROUTE 3: READER GUEST ANONYMOUS */}
              {readerStep === "guest" && (
                <div className="space-y-4">
                  <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 rounded-lg text-[11px] leading-normal space-y-1.5">
                    <p className="font-bold">⚠️ Modo Leitura Rápida (Sem Cadastro):</p>
                    <p>Você navegará em modo privado e anônimo. <strong>Não é possível curtir ou comentar</strong> neste modo sem possui um perfil ativo de leitor validado.</p>
                  </div>

                  <div className="text-[10px] bg-slate-100 dark:bg-slate-950 text-slate-500 dark:text-slate-400 p-2.5 rounded-lg border border-slate-150 dark:border-slate-800/80 leading-relaxed">
                    <span className="font-semibold text-slate-700 dark:text-slate-300">Modo de Leitura Privado:</span> Perfeito para consultar as postagens rápidas e páginas de conteúdo oficial de forma estática sem deixar dados.
                  </div>

                  <button
                    onClick={() => onLoginSuccess("reader", "Visitante Anônimo", false)}
                    className="w-full flex items-center justify-center gap-2 bg-slate-600 hover:bg-slate-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-slate-500/10 cursor-pointer overflow-hidden group transition-all active:scale-98"
                  >
                    Navegar Sem Cadastro
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </button>
                </div>
              )}

              {/* ROUTE 4: READER FORGOT PASSWORD */}
              {readerStep === "forgot_password" && (
                <form onSubmit={handleReaderRecovery} className="space-y-4">
                  <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-700 dark:text-blue-400 rounded-lg text-[11px] leading-normal">
                    💡 <strong>Solicitar Esquecimento de Senha:</strong> Digite seu e-mail cadastrado abaixo. O sistema verificará em banco local e listará suas credenciais para reentrada rápida no protótipo.
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-350 mb-1.5 uppercase tracking-wider">
                      Seu E-mail Cadastrado
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        placeholder="Ex: joao@newshub.com"
                        className="pl-9 pr-4 py-2 w-full text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:border-indigo-500 focus:bg-white focus:outline-hidden dark:focus:bg-slate-900 dark:text-white transition-colors"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setReaderStep("sign_in");
                        setError("");
                        setRecoverySuccessMessage("");
                      }}
                      className="text-[11px] text-slate-500 dark:text-slate-400 hover:text-indigo-650 dark:hover:text-indigo-400 font-medium hover:underline flex items-center gap-1.5 cursor-pointer"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" /> Voltar para o Login de Leitor
                    </button>
                  </div>

                  <button
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs cursor-pointer shadow-md shadow-indigo-500/10 transition-all active:scale-98"
                  >
                    Solicitar Redefinição de Senha
                  </button>
                </form>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
}
