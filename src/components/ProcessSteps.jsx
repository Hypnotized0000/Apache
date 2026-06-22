export function ProcessSteps({ steps }) {
  return (
    <section className="section split" id="lorawan" aria-labelledby="lorawan-title">
      <div>
        <p className="eyebrow">LoRaWAN</p>
        <h2 id="lorawan-title">Een netwerklaag voor kleine berichten met groot bereik.</h2>
      </div>
      <div className="steps" aria-label="Werking van Apache">
        {steps.map((step, index) => (
          <div className="step" key={step}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{step}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
