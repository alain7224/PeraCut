import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { COUNTRIES, AGE_RANGES } from "@/lib/countries";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

const LOCAL_STORAGE_KEY = "peracut-registered";

export function isRegistered(): boolean {
  return localStorage.getItem(LOCAL_STORAGE_KEY) === "1";
}

interface RegistrationModalProps {
  open: boolean;
  onClose: () => void;
  /** Called after successful registration so the caller can proceed with the save action */
  onSuccess: () => void;
}

export default function RegistrationModal({
  open,
  onClose,
  onSuccess,
}: RegistrationModalProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [lastName, setLastName] = useState("");
  const [country, setCountry] = useState("");
  const [ageRange, setAgeRange] = useState<string>("");
  const [consentAge, setConsentAge] = useState(false);
  const [consentMarketing, setConsentMarketing] = useState(false);
  const [error, setError] = useState("");

  const registerMutation = trpc.auth.register.useMutation({
    onSuccess: (data) => {
      if (!data.success) {
        setError(data.message || "Error al registrar");
        return;
      }
      localStorage.setItem(LOCAL_STORAGE_KEY, "1");
      toast.success("¡Registro exitoso! Tu trabajo se guardará ahora.");
      onSuccess();
    },
    onError: (err) => {
      setError(err.message || "Error al registrar");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (username.trim().length < 5) {
      setError("El nombre de usuario debe tener al menos 5 caracteres.");
      return;
    }
    if (!email.trim()) {
      setError("El email es requerido.");
      return;
    }
    if (!name.trim() || name.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres.");
      return;
    }
    if (!lastName.trim() || lastName.trim().length < 2) {
      setError("El apellido debe tener al menos 2 caracteres.");
      return;
    }
    if (!ageRange) {
      setError("Selecciona tu rango de edad.");
      return;
    }
    if (!consentAge) {
      setError("Debes confirmar que tienes 18 años o más.");
      return;
    }

    registerMutation.mutate({
      username: username.trim(),
      email: email.trim(),
      name: name.trim(),
      lastName: lastName.trim(),
      country: country || undefined,
      ageRange: ageRange as "18-24" | "25-34" | "35-49" | "50+",
      consentAge,
      consentMarketing,
    });
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crea tu cuenta para guardar</DialogTitle>
          <DialogDescription>
            Regístrate una sola vez para guardar tu trabajo y continuar editando
            cuando quieras.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          {/* Username */}
          <div className="space-y-1">
            <Label htmlFor="reg-username">
              Nombre de usuario <span className="text-destructive">*</span>
            </Label>
            <Input
              id="reg-username"
              placeholder="mínimo 5 caracteres"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          {/* Name + Last name */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="reg-name">
                Nombre <span className="text-destructive">*</span>
              </Label>
              <Input
                id="reg-name"
                placeholder="Tu nombre"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="given-name"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="reg-lastname">
                Apellido <span className="text-destructive">*</span>
              </Label>
              <Input
                id="reg-lastname"
                placeholder="Tu apellido"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                autoComplete="family-name"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="reg-email">
              Correo electrónico <span className="text-destructive">*</span>
            </Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              required
            />
          </div>

          {/* Country */}
          <div className="space-y-1">
            <Label htmlFor="reg-country">País</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger id="reg-country">
                <SelectValue placeholder="Selecciona tu país" />
              </SelectTrigger>
              <SelectContent className="max-h-56">
                {COUNTRIES.map((c) => (
                  <SelectItem key={c.code} value={c.code}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Age range */}
          <div className="space-y-1">
            <Label htmlFor="reg-age">
              Rango de edad <span className="text-destructive">*</span>
            </Label>
            <Select value={ageRange} onValueChange={setAgeRange}>
              <SelectTrigger id="reg-age">
                <SelectValue placeholder="Selecciona tu rango" />
              </SelectTrigger>
              <SelectContent>
                {AGE_RANGES.map((r) => (
                  <SelectItem key={r.value} value={r.value}>
                    {r.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Consents */}
          <div className="space-y-3 pt-1">
            <div className="flex items-start gap-3">
              <Checkbox
                id="reg-consent-age"
                checked={consentAge}
                onCheckedChange={(v) => setConsentAge(Boolean(v))}
              />
              <Label
                htmlFor="reg-consent-age"
                className="text-sm leading-snug cursor-pointer"
              >
                Confirmo que tengo 18 años o más.{" "}
                <span className="text-destructive">*</span>
              </Label>
            </div>

            <div className="flex items-start gap-3">
              <Checkbox
                id="reg-consent-marketing"
                checked={consentMarketing}
                onCheckedChange={(v) => setConsentMarketing(Boolean(v))}
              />
              <Label
                htmlFor="reg-consent-marketing"
                className="text-sm leading-snug cursor-pointer text-muted-foreground"
              >
                Acepto recibir novedades y que mis datos se usen con fines
                estadísticos y de mejora del servicio. (opcional)
              </Label>
            </div>
          </div>

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}

          <div className="flex gap-2 pt-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={onClose}
              disabled={registerMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={registerMutation.isPending}
            >
              {registerMutation.isPending ? "Registrando…" : "Registrarme y guardar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
