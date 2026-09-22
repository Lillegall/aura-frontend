import React, { useState } from 'react';
import { useI18n, SIGN_IDS, GENDER_IDS, RELATION_IDS, signName } from './i18n.js';
import { Sheet, SignGrid, Btn, Chip } from './ui.jsx';

/* First-run (and later editable) "Your sign" sheet */
export function MySignSheet({ firstRun, value, onSave, onSkip, onClear, onClose }) {
  const { t } = useI18n();
  const [sel, setSel] = useState(value || '');
  return (
    <Sheet
      title={t('onboarding.title')}
      kicker={firstRun ? t('onboarding.kicker') : undefined}
      onClose={firstRun ? onSkip : onClose}
    >
      <p className="lead">{t('onboarding.text')}</p>
      <SignGrid value={sel} onChange={id => { setSel(id); onSave(id); }} />
      <div className="sheet-actions">
        {firstRun && <Btn variant="ghost" onClick={onSkip}>{t('onboarding.skip')}</Btn>}
        {!firstRun && value && <Btn variant="danger" size="sm" onClick={onClear}>{t('onboarding.clear')}</Btn>}
      </div>
    </Sheet>
  );
}

/* Add / edit person form. `initial` may be a partial (e.g. prefilled sign from analysis). */
export function PersonFormSheet({ initial, displayName, isEdit, onSave, onDelete, onClose }) {
  const { t, lang } = useI18n();
  const [name, setName] = useState(displayName || '');
  const [sign, setSign] = useState(initial.sign || '');
  const [ascendant, setAscendant] = useState(initial.ascendant || '');
  const [gender, setGender] = useState(initial.gender || 'other');
  const [relation, setRelation] = useState(initial.relation || 'partner');
  const [errors, setErrors] = useState({});
  const [armed, setArmed] = useState(false);

  function submit(e) {
    e.preventDefault();
    const errs = {};
    if (!name.trim()) errs.name = t('form.nameRequired');
    if (!sign) errs.sign = t('form.signRequired');
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSave({ name: name.trim(), sign, ascendant, gender, relation });
  }

  return (
    <Sheet title={isEdit ? t('form.editTitle') : t('form.addTitle')} onClose={onClose}>
      <form onSubmit={submit} noValidate>
        <div className="field">
          <label htmlFor="pf-name">{t('form.name')}</label>
          <input id="pf-name" value={name} maxLength={60} autoComplete="off"
            placeholder={t('form.namePlaceholder')} onChange={e => setName(e.target.value)}
            aria-invalid={errors.name ? 'true' : 'false'} aria-describedby={errors.name ? 'pf-name-err' : undefined} />
          {errors.name && <div className="err" id="pf-name-err">{errors.name}</div>}
        </div>

        <div className="field" role="group" aria-labelledby="pf-sign-l">
          <div className="field-label" id="pf-sign-l">{t('form.sign')}</div>
          <SignGrid value={sign} onChange={setSign} />
          {errors.sign && <div className="err">{errors.sign}</div>}
        </div>

        <div className="field">
          <label htmlFor="pf-asc">{t('form.ascendant')} · {t('common.optional')}</label>
          <select id="pf-asc" value={ascendant} onChange={e => setAscendant(e.target.value)}>
            <option value="">{t('form.ascNone')}</option>
            {SIGN_IDS.map(id => <option key={id} value={id}>{signName(lang, id)}</option>)}
          </select>
        </div>

        <div className="field" role="group" aria-labelledby="pf-gender-l">
          <div className="field-label" id="pf-gender-l">{t('form.gender')}</div>
          <div className="chips">
            {GENDER_IDS.map(g => <Chip key={g} active={gender === g} onClick={() => setGender(g)}>{t(`genders.${g}`)}</Chip>)}
          </div>
        </div>

        <div className="field" role="group" aria-labelledby="pf-rel-l">
          <div className="field-label" id="pf-rel-l">{t('form.relation')}</div>
          <div className="chips">
            {RELATION_IDS.map(r => <Chip key={r} active={relation === r} onClick={() => setRelation(r)}>{t(`relations.${r}`)}</Chip>)}
          </div>
        </div>

        <div className="sheet-actions">
          <button type="submit" className="btn primary">{t('form.save')}</button>
          {isEdit && (
            <Btn variant="danger" size="sm" className={armed ? 'armed' : ''}
              onClick={() => (armed ? onDelete() : setArmed(true))}>
              {armed ? t('form.confirmDelete') : t('form.delete')}
            </Btn>
          )}
        </div>
      </form>
    </Sheet>
  );
}

export function PrivacySheet({ onClose, onClearData }) {
  const { t } = useI18n();
  const [armed, setArmed] = useState(false);
  const sections = t('privacy.sections');
  return (
    <Sheet title={t('privacy.title')} onClose={onClose}>
      {Array.isArray(sections) && sections.map(s => (
        <section key={s.h}>
          <h3>{s.h}</h3>
          <p>{s.p}</p>
        </section>
      ))}
      <div className="sheet-actions">
        <Btn variant="danger" size="sm" className={armed ? 'armed' : ''}
          onClick={() => (armed ? onClearData() : setArmed(true))}>
          {armed ? t('privacy.confirmClear') : t('privacy.clearData')}
        </Btn>
      </div>
    </Sheet>
  );
}
