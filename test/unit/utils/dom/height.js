import TestCase from '../../../testcase.js';

class Test extends TestCase
{
   run()
   {
        describe('height()', () =>
        {
            let scratch;

            const [height] = frontbx.import(['height']).from('_');
            
            beforeEach(() =>
            {
                scratch = this.setupScratch();
            });

            afterEach(() =>
            {
                this.teardown(scratch);
            });

            it('should read element height', () =>
            {
                scratch.style.height = '200px';

                this.expect(height(scratch)).to.equal(200);
            });

            it('should retrieve float values', () =>
            {
                scratch.style.height = '200.5px';

                this.expect(height(scratch)).to.equal(200.5);
            });

            it('should read element height from stylesheet rules', () =>
            {
                let css    = '#scratch { height: 100px; }',
                head       = document.head || document.getElementsByTagName('head')[0],
                style      = document.createElement('style');
                style.type = 'text/css';

                if (style.styleSheet)
                {
                  style.styleSheet.cssText = css;
                }
                else
                {
                  style.appendChild(document.createTextNode(css));
                }

                head.appendChild(style);

                this.expect(height(scratch)).to.equal(100);

                style.parentNode.removeChild(style);
            });

            it('Inline styles should override style-sheet rules', () =>
            {
                let css    = '#scratch { height: 100px; }',
                head       = document.head || document.getElementsByTagName('head')[0],
                style      = document.createElement('style');
                style.type = 'text/css';

                if (style.styleSheet)
                {
                  style.styleSheet.cssText = css;
                }
                else
                {
                  style.appendChild(document.createTextNode(css));
                }

                head.appendChild(style);

                scratch.style.height = '200px';

                this.expect(height(scratch)).to.equal(200);

                style.parentNode.removeChild(style);
            });

            it('should ignore ignore padding and borders', () =>
            {
                scratch.style.height  = '50px';
                 scratch.style.borderTop = '5px solid';
                scratch.style.padding = '20px';

                this.expect(height(scratch)).to.equal(50);
            });

            it('should work on hidden elements', () =>
            {
                scratch.style.height  = '50px';
                scratch.style.display = 'none';
                scratch.style.visibility = 'hidden';
                scratch.style.opacity    = '0';

                this.expect(height(scratch)).to.equal(50);

                this.expect(scratch.style.display).to.equal('none');
                this.expect(scratch.style.visibility).to.equal('hidden');
                this.expect(scratch.style.opacity).to.equal('0');
            });

        });
    }
}

let test = new Test();

test.run();