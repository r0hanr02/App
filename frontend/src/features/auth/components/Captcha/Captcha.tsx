import { RefreshCw } from "lucide-react";
import { Input } from "../../../../components/ui/Input/Input";
import { useCaptcha } from "../../api/captcha.api";
import "./style.scss";

export interface CaptchaProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

const Captcha = ({ value, onChange, error }: CaptchaProps) => {
  const { data, isLoading, isFetching, refetch } = useCaptcha();

  const image = data?.data?.image;
  const isSpinning = isFetching && !isLoading;

  return (
    <div className="captcha">
      <div className="captcha__preview">
        {image ? (
          <img src={image} alt="Captcha challenge" className="captcha__image" />
        ) : (
          <span className="captcha__placeholder">Loading...</span>
        )}

        <button
          type="button"
          className="captcha__refresh"
          aria-label="Refresh captcha"
          title="Refresh captcha"
          disabled={isFetching}
          onClick={() => {
            void refetch();
          }}
        >
          <RefreshCw size={16} className={isSpinning ? "is-spinning" : ""} />
        </button>
      </div>

      <Input
        name="captcha"
        value={value}
        label="Captcha:"
        placeholder="Enter the characters shown"
        autoComplete="off"
        maxLength={8}
        error={error ?? undefined}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};

export default Captcha;
