-- Insert vetted universities data
-- Run this in your Supabase SQL Editor after running the main schema

INSERT INTO public.universities (name, website, is_verified) VALUES
-- Top US Universities
('Massachusetts Institute of Technology', 'https://mit.edu', true),
('Stanford University', 'https://stanford.edu', true),
('Harvard University', 'https://harvard.edu', true),
('California Institute of Technology', 'https://caltech.edu', true),
('University of California, Berkeley', 'https://berkeley.edu', true),
('Princeton University', 'https://princeton.edu', true),
('Yale University', 'https://yale.edu', true),
('University of Chicago', 'https://uchicago.edu', true),
('Columbia University', 'https://columbia.edu', true),
('Cornell University', 'https://cornell.edu', true),
('University of Pennsylvania', 'https://upenn.edu', true),
('Johns Hopkins University', 'https://jhu.edu', true),
('Northwestern University', 'https://northwestern.edu', true),
('Duke University', 'https://duke.edu', true),
('Carnegie Mellon University', 'https://cmu.edu', true),

-- Top International Universities
('University of Oxford', 'https://ox.ac.uk', true),
('University of Cambridge', 'https://cam.ac.uk', true),
('ETH Zurich', 'https://ethz.ch', true),
('Imperial College London', 'https://imperial.ac.uk', true),
('University College London', 'https://ucl.ac.uk', true),
('London School of Economics', 'https://lse.ac.uk', true),
('University of Toronto', 'https://utoronto.ca', true),
('McGill University', 'https://mcgill.ca', true),
('University of Melbourne', 'https://unimelb.edu.au', true),
('Australian National University', 'https://anu.edu.au', true),
('University of Tokyo', 'https://u-tokyo.ac.jp', true),
('Kyoto University', 'https://kyoto-u.ac.jp', true),
('National University of Singapore', 'https://nus.edu.sg', true),
('Nanyang Technological University', 'https://ntu.edu.sg', true),
('Tsinghua University', 'https://tsinghua.edu.cn', true),
('Peking University', 'https://pku.edu.cn', true),

-- European Universities
('Technical University of Munich', 'https://tum.de', true),
('University of Copenhagen', 'https://ku.dk', true),
('Karolinska Institute', 'https://ki.se', true),
('École Polytechnique Fédérale de Lausanne', 'https://epfl.ch', true),
('Sorbonne University', 'https://sorbonne-universite.fr', true),
('KU Leuven', 'https://kuleuven.be', true),
('Delft University of Technology', 'https://tudelft.nl', true),
('University of Amsterdam', 'https://uva.nl', true),

-- Additional Research-Focused Institutions
('Max Planck Institute', 'https://mpg.de', true),
('CERN', 'https://cern.ch', true),
('Broad Institute', 'https://broadinstitute.org', true),
('Scripps Research', 'https://scripps.edu', true),
('Cold Spring Harbor Laboratory', 'https://cshl.edu', true),
('Rockefeller University', 'https://rockefeller.edu', true),
('Weizmann Institute of Science', 'https://weizmann.ac.il', true),
('RIKEN', 'https://riken.jp', true);
