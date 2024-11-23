import { DeleteRelationship } from '@/actions/relationships/deleteRelationship'
import {
    AlertDialogContent,
    AlertDialogTitle,
    AlertDialogHeader,
    AlertDialogDescription,
    AlertDialog,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction
} from '@/components/ui/alert-dialog'
import { Input } from '@/components/ui/input'
import { useMutation } from '@tanstack/react-query'
import React from 'react'
import { toast } from 'sonner'

type Props = {
  open: boolean,
  setOpen: (open: boolean) => void,
  relationshipName: string,
  relationshipId: string
}

function DeleteRelationshipDialog({open, setOpen, relationshipName, relationshipId}: Props) {
  const [confirmText, setConfirmText] = React.useState('')

  const deleteMutation = useMutation({
    mutationFn: DeleteRelationship,
    onSuccess: () => {
      toast.success('Relationship deleted successfully', { id: relationshipId });
      setConfirmText('');
      setOpen(false);
    },
    onError: (error) => {
      toast.error(error.message, { id: relationshipId });
    }
  });

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription className="space-y-4">
            <div>
              This action is irreversible. Once deleted, this relationship and all associated data will be permanently removed from our servers. This includes:
            </div>
            
            <ul className="list-disc pl-5">
              <li>All related sessions, including messages exchanged.</li>
              <li>Analyses tied to this relationship.</li>
              <li>Shared data, such as documents and files linked to this relationship.</li>
            </ul>
            
            <div>
              <strong>Important:</strong> Deletion cannot be undone. Ensure you've saved any critical information before proceeding.
            </div>
            
            <div className="flex flex-col py-4 gap-2">
              <div>
                To confirm, type <strong>{relationshipName}</strong> below.
              </div>
              <Input 
                value={confirmText} 
                onChange={(e) => setConfirmText(e.target.value)} 
              />
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction 
            disabled={relationshipName !== confirmText || deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(e) => {
              e.stopPropagation();
              toast.loading("Deleting relationship...", { id: relationshipId });
              deleteMutation.mutate(relationshipId);
            }}
          >
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export default DeleteRelationshipDialog;