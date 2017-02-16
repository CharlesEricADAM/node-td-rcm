import fs from 'fs';
import T0Totalization from './T0Totalization';

/**
 * RCM class
 */
class RCM {
  /**
   * @param  {D0Issuer} d0
   * @param  {Object}   [personInCharge]
   * @param  {String}   [personInCharge.fullname]  T010 Nom Prénom
   * @param  {String}   [personInCharge.phone]     T011 Numéro de téléphone
   * @param  {String}   [personInCharge.email]     T012 Adresse courriel
   */
  constructor(d0, personInCharge = {}) {
    this.d0 = d0;
    this.personInCharge = personInCharge;
    this.recipients = [];
  }

  /**
   * Add Recipient
   *
   * @param {R1Recipient} r1
   * @param {R2Amount}    r2
   * @param {Object}      r3 unimplemented
   */
  addRecipient(r1, r2, r3) {
    this.recipients.push([r1, r2, r3])
  }

  /**
   * Export data
   *
   * @param  {Boolean} [inline=false] Set to `true` for inline export
   * @return {String|Array}
   */
  export(inline = false) {
    const t0 = new T0Totalization(this).export();
    const d0 = this.d0.export();

    const exportedRecipient = this.recipients.reduce((acc, r) => {
      try {
        const r0 = r[0].export();
        const r1 = r[1].export();

        return acc.concat((inline) ? [
          '\n',
          ...r0,
          '\n',
          ...r1
        ] : [
          ...r0,
          ...r1
        ]);
      } catch (err) {
        throw err;
      }
    }, []);

    return (inline) ? [
      ...d0,
      ...exportedRecipient,
      '\n',
      ...t0
    ].join('') : [
      ...d0,
      ...exportedRecipient,
      ...t0
    ];
  }

  toFile(filename) {
    return new Promise((resolve, reject) => {
      try {
        const exportedRcm = this.export(true);

        fs.writeFile(filename, exportedRcm, 'latin1', (err) => {
          if (err) {
            return reject(err);
          }

          return resolve();
        })
      } catch (err) {
        return reject(err)
      }
    });
  }
}

export default RCM;
