QUnit.module('Notifications — escapeHtml');

QUnit.test('Escapa <', assert => {
    assert.equal(Notifications.escapeHtml('<script>'), '&lt;script&gt;');
});

QUnit.test('Escapa &', assert => {
    assert.equal(Notifications.escapeHtml('a & b'), 'a &amp; b');
});

QUnit.test('Escapa caracteres especiais', assert => {
    assert.equal(Notifications.escapeHtml('"\'&<>'), '&quot;&#39;&amp;&lt;&gt;');
});

QUnit.test('Texto sem caracteres especiais', assert => {
    assert.equal(Notifications.escapeHtml('Olá Mundo'), 'Olá Mundo');
});

QUnit.module('Notifications — getIcon');

QUnit.test('Ícone de sucesso', assert => {
    assert.equal(Notifications.getIcon('success'), '✓');
});

QUnit.test('Ícone de erro', assert => {
    assert.equal(Notifications.getIcon('error'), '✕');
});

QUnit.test('Ícone de aviso', assert => {
    assert.equal(Notifications.getIcon('warning'), '⚠');
});

QUnit.test('Ícone de info', assert => {
    assert.equal(Notifications.getIcon('info'), 'ℹ');
});

QUnit.test('Ícone desconhecido', assert => {
    assert.equal(Notifications.getIcon('unknown'), '•');
});