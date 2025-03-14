import TestCase from '../../../testcase.js';

class Test extends TestCase
{
   run()
   {
        describe('inner_HTML()', () =>
        {
            let scratch;

            const [inner_HTML] = frontbx.import(['inner_HTML']).from('_');
            
            beforeEach(() =>
            {
                scratch = this.setupScratch();
            });

            afterEach(() =>
            {
                this.teardown(scratch);
            });

            it('should insert string content', () =>
            {
                inner_HTML(scratch, 'foobar');

                this.expect(scratch.innerHTML).to.equal('foobar');
            });

            it('should insert html string content', () =>
            {
                inner_HTML(scratch, '<span>foobar</span>');

                this.expect(scratch.children[0].tagName.toLowerCase()).to.equal('span');

                this.expect(scratch.children[0].innerHTML).to.equal('foobar');
            });

            it('should insert string arrays', () =>
            {
                inner_HTML(scratch, ['foo', 'bar']);

                this.expect(scratch.innerHTML).to.equal('foobar');
            });

            it('should insert html string arrays', () =>
            {
                inner_HTML(scratch, ['<span>foo</span>', '<span>bar</span>']);

                this.expect(scratch.children[0].tagName.toLowerCase()).to.equal('span');

                this.expect(scratch.children[0].innerHTML).to.equal('foo');

                this.expect(scratch.children[1].tagName.toLowerCase()).to.equal('span');

                this.expect(scratch.children[1].innerHTML).to.equal('bar');
            });


            it('should insert html mixed arrays', () =>
            {
                inner_HTML(scratch, ['<span>foo</span>', '<span>bar</span>', document.createElement('div')]);

                this.expect(scratch.children[0].tagName.toLowerCase()).to.equal('span');

                this.expect(scratch.children[0].innerHTML).to.equal('foo');

                this.expect(scratch.children[1].tagName.toLowerCase()).to.equal('span');

                this.expect(scratch.children[1].innerHTML).to.equal('bar');

                this.expect(scratch.children[2].tagName.toLowerCase()).to.equal('div');
            });

            it('should append string content', () =>
            {
                inner_HTML(scratch, 'foo');

                inner_HTML(scratch, 'bar', true);

                this.expect(scratch.innerHTML).to.equal('foobar');
            });

            it('should append html string content', () =>
            {
                inner_HTML(scratch, '<span>foo</span>');

                inner_HTML(scratch, '<span>bar</span>', true);

                this.expect(scratch.children[0].tagName.toLowerCase()).to.equal('span');

                this.expect(scratch.children[0].innerHTML).to.equal('foo');

                this.expect(scratch.children[1].tagName.toLowerCase()).to.equal('span');

                this.expect(scratch.children[1].innerHTML).to.equal('bar');
            });

            it('should append string arrays', () =>
            {
                inner_HTML(scratch, 'foo');

                inner_HTML(scratch, ['bar'], true);

                this.expect(scratch.innerHTML).to.equal('foobar');
            });

            it('should append html string arrays', () =>
            {
                inner_HTML(scratch, '<span>foo</span>');

                inner_HTML(scratch, ['<span>bar</span>'], true);

                this.expect(scratch.children[0].tagName.toLowerCase()).to.equal('span');

                this.expect(scratch.children[0].innerHTML).to.equal('foo');

                this.expect(scratch.children[1].tagName.toLowerCase()).to.equal('span');

                this.expect(scratch.children[1].innerHTML).to.equal('bar');
            });

        });
    }
}

let test = new Test();

test.run();