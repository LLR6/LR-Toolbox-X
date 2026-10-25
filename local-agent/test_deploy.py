import unittest,tempfile,pathlib
from unittest.mock import patch
from deploy import Manager
class DeploymentTests(unittest.TestCase):
 def test_missing_environment_and_unknown_tool(self):
  with tempfile.TemporaryDirectory() as root:
   m=Manager(root)
   self.assertTrue(all(x['state']=='not_installed' for x in m.status()))
   with self.assertRaises(ValueError):m.install('arbitrary-command')
 def test_busy_install_rejected(self):
  with tempfile.TemporaryDirectory() as root:
   m=Manager(root);m.jobs['akshare']={'running':True}
   with self.assertRaises(ValueError):m.install('docling')
 def test_failure_is_reported(self):
  with tempfile.TemporaryDirectory() as root:
   m=Manager(root)
   with patch('deploy.venv.EnvBuilder.create',side_effect=RuntimeError('dependency unavailable')):m._install('akshare')
   result=next(x for x in m.status() if x['id']=='akshare')
   self.assertEqual(result['state'],'error');self.assertIn('dependency unavailable',result['detail'])
if __name__=='__main__':unittest.main()
