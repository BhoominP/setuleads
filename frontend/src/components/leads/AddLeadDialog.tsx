import { useState, type FormEvent } from 'react';
import { useAddLead } from '@/hooks/useLeads';
import { LocationInput } from './LocationInput';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from '@phosphor-icons/react';
import type { LeadSource, LeadStage } from '@/types/lead';

interface AddLeadDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddLeadDialog({ isOpen, onClose }: AddLeadDialogProps) {
  const addLeadMutation = useAddLead();

  const [businessName, setBusinessName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [location, setLocation] = useState('Vadodara, Gujarat');
  const [source, setSource] = useState<LeadSource>('manual');
  const [stage, setStage] = useState<LeadStage>('new');
  const [estimatedValue, setEstimatedValue] = useState('25000');
  const [generalNotes, setGeneralNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!businessName.trim()) {
      setError('Business name is required.');
      return;
    }

    setError(null);
    try {
      await addLeadMutation.mutateAsync({
        business_name: businessName.trim(),
        contact_name: contactName.trim() || null,
        email: email.trim() || null,
        phone: phone.trim() || null,
        website_url: websiteUrl.trim() || null,
        location: location.trim() || null,
        source,
        stage,
        estimated_value: estimatedValue ? parseFloat(estimatedValue) : null,
        general_notes: generalNotes.trim() || null,
        website_notes: websiteUrl ? null : 'No website listed upon initial manual entry.',
      });

      // Reset form & close
      setBusinessName('');
      setContactName('');
      setEmail('');
      setPhone('');
      setWebsiteUrl('');
      setGeneralNotes('');
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Failed to save lead');
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-base/80 backdrop-blur-xs p-4">
      <div className="inspected-panel bg-panel border border-border p-6 w-full max-w-lg shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-ink"
        >
          <X size={18} />
        </button>

        <p className="font-mono text-xs text-muted-foreground tracking-wide mb-1">Manual Input</p>
        <h2 className="font-serif text-xl text-ink mb-4">Add Potential Client</h2>

        {error && <p className="text-xs font-mono text-rust mb-3">{error}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="business_name" className="text-xs text-muted-foreground">
              Business Name *
            </Label>
            <Input
              id="business_name"
              placeholder="e.g. Apex Wooden Crafts"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              className="mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="contact_name" className="text-xs text-muted-foreground">
                Contact Person
              </Label>
              <Input
                id="contact_name"
                placeholder="Owner / Manager"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="location" className="text-xs text-muted-foreground mb-1 block">
                City / Location
              </Label>
              <LocationInput value={location} onChange={setLocation} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="phone" className="text-xs text-muted-foreground">
                Phone Number
              </Label>
              <Input
                id="phone"
                placeholder="+91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email" className="text-xs text-muted-foreground">
                Email Address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="contact@business.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="website_url" className="text-xs text-muted-foreground">
              Existing Website URL (Leave blank if no site)
            </Label>
            <Input
              id="website_url"
              placeholder="https://example.com"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              className="mt-1 font-mono text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs text-muted-foreground">Lead Source</Label>
              <Select value={source} onValueChange={(val) => setSource(val as LeadSource)}>
                <SelectTrigger className="mt-1 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manual">Manual Entry</SelectItem>
                  <SelectItem value="google_places">Google Places</SelectItem>
                  <SelectItem value="referral">Referral</SelectItem>
                  <SelectItem value="telegram">Telegram</SelectItem>
                  <SelectItem value="internshala">Internshala</SelectItem>
                  <SelectItem value="inbound_form">Inbound Form</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground">Initial Stage</Label>
              <Select value={stage} onValueChange={(val) => setStage(val as LeadStage)}>
                <SelectTrigger className="mt-1 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="contacted">Contacted</SelectItem>
                  <SelectItem value="replied">Replied</SelectItem>
                  <SelectItem value="negotiating">Negotiating</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="est_value" className="text-xs text-muted-foreground">
                Est. Value (₹)
              </Label>
              <Input
                id="est_value"
                type="number"
                value={estimatedValue}
                onChange={(e) => setEstimatedValue(e.target.value)}
                className="mt-1 font-mono text-xs"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes" className="text-xs text-muted-foreground">
              Initial General Notes
            </Label>
            <Input
              id="notes"
              placeholder="e.g. Visited shop in person, spoke with owner regarding website revamp."
              value={generalNotes}
              onChange={(e) => setGeneralNotes(e.target.value)}
              className="mt-1"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button type="button" variant="outline" onClick={onClose} className="text-xs font-mono">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={addLeadMutation.isPending}
              className="bg-rust hover:bg-rust/90 text-ink text-xs font-mono"
            >
              {addLeadMutation.isPending ? 'Saving…' : 'Save Lead'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
