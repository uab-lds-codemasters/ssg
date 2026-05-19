QUnit.module('Validation — validateJSON');

QUnit.test('JSON válido', assert => {
    const result = Validation.validateJSON('{"title":"Teste"}');
    assert.true(result.valid);
    assert.equal(result.error, null);
});

QUnit.test('JSON inválido', assert => {
    const result = Validation.validateJSON('{title:}');
    assert.false(result.valid);
    assert.notEqual(result.error, null);
});

QUnit.test('JSON vazio', assert => {
    const result = Validation.validateJSON('');
    assert.false(result.valid);
    assert.equal(result.error, 'JSON não pode estar vazio');
});

QUnit.test('JSON null', assert => {
    const result = Validation.validateJSON(null);
    assert.false(result.valid);
    assert.equal(result.error, 'JSON não pode estar vazio');
});

QUnit.test('JSON array', assert => {
    const result = Validation.validateJSON('[{"title":"A"},{"title":"B"}]');
    assert.true(result.valid);
});

QUnit.module('Validation — validateURL');

QUnit.test('URL absoluta http', assert => {
    assert.true(Validation.validateURL('https://example.com'));
});

QUnit.test('URL absoluta https', assert => {
    assert.true(Validation.validateURL('https://example.com/path'));
});

QUnit.test('URL relativa /', assert => {
    assert.true(Validation.validateURL('/'));
});

QUnit.test('URL relativa /path', assert => {
    assert.true(Validation.validateURL('/sobre'));
});

QUnit.test('URL relativa ./', assert => {
    assert.true(Validation.validateURL('./pagina'));
});

QUnit.test('URL vazia (opcional)', assert => {
    assert.true(Validation.validateURL(''));
});

QUnit.test('URL inválida', assert => {
    assert.false(Validation.validateURL('not a url'));
});

QUnit.module('Validation — validateRequired');

QUnit.test('Campo preenchido', assert => {
    const result = Validation.validateRequired('Olá', 'Título');
    assert.true(result.valid);
});

QUnit.test('Campo vazio', assert => {
    const result = Validation.validateRequired('', 'Título');
    assert.false(result.valid);
    assert.equal(result.error, 'Título é obrigatório');
});

QUnit.test('Campo só espaços', assert => {
    const result = Validation.validateRequired('   ', 'Nome');
    assert.false(result.valid);
});

QUnit.module('Validation — validateFileSize');

QUnit.test('Ficheiro dentro do limite', assert => {
    const file = new File(['a'.repeat(1024)], 'test.jpg');
    const result = Validation.validateFileSize(file, 5);
    assert.true(result.valid);
});

QUnit.test('Ficheiro excede limite', assert => {
    const file = new File(['a'.repeat(6 * 1024 * 1024)], 'big.jpg');
    const result = Validation.validateFileSize(file, 5);
    assert.false(result.valid);
    assert.equal(result.error, 'Ficheiro muito grande (máx: 5MB)');
});

QUnit.test('Sem ficheiro', assert => {
    const result = Validation.validateFileSize(null, 5);
    assert.true(result.valid);
});

QUnit.module('Validation — validateFileType');

QUnit.test('Tipo permitido', assert => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const result = Validation.validateFileType(file, ['image/jpeg', 'image/png']);
    assert.true(result.valid);
});

QUnit.test('Tipo não permitido', assert => {
    const file = new File([''], 'test.exe', { type: 'application/x-msdownload' });
    const result = Validation.validateFileType(file, ['image/jpeg']);
    assert.false(result.valid);
});

QUnit.test('Sem ficheiro', assert => {
    const result = Validation.validateFileType(null, ['image/jpeg']);
    assert.true(result.valid);
});

QUnit.module('Validation — validateMenuItems');

QUnit.test('Menu vazio', assert => {
    const result = Validation.validateMenuItems([]);
    assert.false(result.valid);
    assert.equal(result.error, 'Menu deve ter pelo menos 1 item');
});

QUnit.test('Menu com 1 item válido', assert => {
    const items = [{ title: 'Início', link: '/', children: [] }];
    const result = Validation.validateMenuItems(items);
    assert.true(result.valid);
});

QUnit.test('Menu com item sem título', assert => {
    const items = [{ title: '', link: '/', children: [] }];
    const result = Validation.validateMenuItems(items);
    assert.false(result.valid);
});

QUnit.test('Menu com item sem link nem filhos', assert => {
    const items = [{ title: 'Item', link: '', children: [] }];
    const result = Validation.validateMenuItems(items);
    assert.false(result.valid);
});

QUnit.test('Menu com item sem link mas com filhos', assert => {
    const items = [{ title: 'Item', link: '', children: [{ title: 'Sub', link: '/sub' }] }];
    const result = Validation.validateMenuItems(items);
    assert.true(result.valid);
});

QUnit.test('Menu com subitem sem título', assert => {
    const items = [{ title: 'Item', link: '', children: [{ title: '', link: '/sub' }] }];
    const result = Validation.validateMenuItems(items);
    assert.false(result.valid);
});

QUnit.module('Validation — validateForm');

QUnit.test('Formulário completo válido', assert => {
    const landing = JSON.stringify({ title: 'T', subtitle: 'S', theme: 'default.css', content: '', footer: '' });
    const menu = JSON.stringify([{ title: 'Início', link: '/', children: [] }]);
    const result = Validation.validateForm('Título', 'Subtítulo', landing, menu);
    assert.true(result.valid);
    assert.equal(result.errors.length, 0);
});

QUnit.test('Formulário sem título', assert => {
    const landing = JSON.stringify({ title: '', subtitle: '', theme: 'default.css', content: '', footer: '' });
    const menu = JSON.stringify([{ title: 'Início', link: '/', children: [] }]);
    const result = Validation.validateForm('', 'Subtítulo', landing, menu);
    assert.false(result.valid);
    assert.ok(result.errors.some(e => e.includes('Título')));
});

QUnit.test('Formulário com JSON inválido', assert => {
    const result = Validation.validateForm('Título', 'Subtítulo', '{invalid}', '[]');
    assert.false(result.valid);
});